alter table public.transactions
add column if not exists bonus_units integer not null default 0 check (bonus_units >= 0);

alter table public.transactions
add column if not exists deleted_at timestamptz;

create or replace function public.save_transaction(
  p_transaction_id uuid,
  p_nomor_bon text,
  p_tanggal date,
  p_customer_id uuid,
  p_ongkir numeric,
  p_deskripsi text,
  p_is_bonus boolean,
  p_status text,
  p_tanggal_lunas date,
  p_bonus_units integer,
  p_lines jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_owner uuid := (select auth.uid());
  saved_transaction_id uuid;
  line_item jsonb;
  is_new_transaction boolean := p_transaction_id is null;
  customer_threshold numeric(15, 2);
  customer_granted integer;
  paid_omzet numeric(15, 2);
  available_bonus integer;
  old_is_bonus boolean := false;
  old_bonus_units integer := 0;
  old_customer_id uuid;
begin
  if current_owner is null then
    raise exception 'authentication required';
  end if;

  if p_nomor_bon is null or btrim(p_nomor_bon) = '' then
    raise exception 'nomor bon wajib diisi';
  end if;

  if p_status not in ('piutang', 'lunas') then
    raise exception 'status tidak valid';
  end if;

  if p_status = 'lunas' and p_tanggal_lunas is null then
    raise exception 'tanggal pelunasan wajib diisi';
  end if;

  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'minimal satu produk wajib diisi';
  end if;

  if coalesce(p_is_bonus, false) and coalesce(p_bonus_units, 0) < 1 then
    raise exception 'jumlah bonus wajib diisi';
  end if;

  if not is_new_transaction then
    select is_bonus, bonus_units, customer_id
    into old_is_bonus, old_bonus_units, old_customer_id
    from public.transactions
    where id = p_transaction_id
      and owner_uid = current_owner;

    if old_customer_id is null then
      raise exception 'bon tidak ditemukan';
    end if;
  end if;

  select bonus_threshold, bonuses_granted
  into customer_threshold, customer_granted
  from public.customers
  where id = p_customer_id
    and owner_uid = current_owner
    and deleted_at is null;

  if customer_threshold is null then
    raise exception 'pelanggan tidak ditemukan';
  end if;

  if coalesce(p_is_bonus, false) then
    select coalesce(sum(line.line_omzet), 0)
    into paid_omzet
    from public.transactions transaction
    join public.transaction_lines line on line.transaction_id = transaction.id
    where transaction.owner_uid = current_owner
      and transaction.customer_id = p_customer_id
      and transaction.status = 'lunas'
      and transaction.is_bonus = false
      and transaction.deleted_at is null;

    available_bonus := case
      when customer_threshold <= 0 then 0
      else greatest(
        0,
        floor(paid_omzet / customer_threshold)::integer
          - customer_granted
          + case when old_is_bonus and old_customer_id = p_customer_id then old_bonus_units else 0 end
      )
    end;

    if coalesce(p_bonus_units, 0) > available_bonus then
      raise exception 'bonus belum mencukupi';
    end if;
  end if;

  if is_new_transaction then
    insert into public.transactions (
      owner_uid, nomor_bon, tanggal, customer_id, ongkir, deskripsi,
      is_bonus, bonus_units, status, tanggal_lunas
    )
    values (
      current_owner, btrim(p_nomor_bon), p_tanggal, p_customer_id,
      greatest(0, coalesce(p_ongkir, 0)),
      nullif(btrim(coalesce(p_deskripsi, '')), ''),
      coalesce(p_is_bonus, false),
      case when coalesce(p_is_bonus, false) then p_bonus_units else 0 end,
      p_status,
      case when p_status = 'lunas' then p_tanggal_lunas else null end
    )
    returning id into saved_transaction_id;
  else
    update public.transactions
    set
      nomor_bon = btrim(p_nomor_bon),
      tanggal = p_tanggal,
      customer_id = p_customer_id,
      ongkir = greatest(0, coalesce(p_ongkir, 0)),
      deskripsi = nullif(btrim(coalesce(p_deskripsi, '')), ''),
      is_bonus = coalesce(p_is_bonus, false),
      bonus_units = case when coalesce(p_is_bonus, false) then p_bonus_units else 0 end,
      status = p_status,
      tanggal_lunas = case when p_status = 'lunas' then p_tanggal_lunas else null end
    where id = p_transaction_id
      and owner_uid = current_owner
      and deleted_at is null
    returning id into saved_transaction_id;

    delete from public.transaction_lines
    where transaction_id = saved_transaction_id
      and owner_uid = current_owner;
  end if;

  for line_item in select * from jsonb_array_elements(p_lines)
  loop
    insert into public.transaction_lines (
      owner_uid, transaction_id, product_id, product_type, harga_modal_snap,
      harga_base_snap, discounted_price, qty, line_omzet, line_laba_hl
    )
    values (
      current_owner,
      saved_transaction_id,
      (line_item ->> 'product_id')::uuid,
      line_item ->> 'product_type',
      (line_item ->> 'harga_modal_snap')::numeric,
      (line_item ->> 'harga_base_snap')::numeric,
      (line_item ->> 'discounted_price')::numeric,
      (line_item ->> 'qty')::integer,
      (line_item ->> 'line_omzet')::numeric,
      (line_item ->> 'line_laba_hl')::numeric
    );
  end loop;

  if old_is_bonus then
    update public.customers
    set bonuses_granted = greatest(0, bonuses_granted - old_bonus_units)
    where id = old_customer_id
      and owner_uid = current_owner;
  end if;

  if coalesce(p_is_bonus, false) then
    update public.customers
    set bonuses_granted = bonuses_granted + p_bonus_units
    where id = p_customer_id
      and owner_uid = current_owner;
  end if;

  return saved_transaction_id;
exception
  when unique_violation then
    raise exception 'Nomor bon sudah digunakan.';
end;
$$;

create or replace function public.delete_transaction(p_transaction_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_owner uuid := (select auth.uid());
  deleted_customer_id uuid;
  deleted_is_bonus boolean;
  deleted_bonus_units integer;
begin
  select customer_id, is_bonus, bonus_units
  into deleted_customer_id, deleted_is_bonus, deleted_bonus_units
  from public.transactions
  where id = p_transaction_id
    and owner_uid = current_owner
    and deleted_at is null;

  if deleted_customer_id is null then
    raise exception 'bon tidak ditemukan';
  end if;

  update public.transactions
  set deleted_at = now()
  where id = p_transaction_id
    and owner_uid = current_owner
    and deleted_at is null;

  if deleted_is_bonus then
    update public.customers
    set bonuses_granted = greatest(0, bonuses_granted - deleted_bonus_units)
    where id = deleted_customer_id
      and owner_uid = current_owner;
  end if;
end;
$$;

revoke execute on function public.delete_transaction(uuid) from public;
grant execute on function public.delete_transaction(uuid) to authenticated;

create or replace function public.settle_month(
  p_customer_id uuid,
  p_year integer,
  p_month integer,
  p_tanggal_lunas date default current_date
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  affected_count integer;
begin
  update public.transactions
  set
    status = 'lunas',
    tanggal_lunas = p_tanggal_lunas
  where owner_uid = (select auth.uid())
    and customer_id = p_customer_id
    and status = 'piutang'
    and is_bonus = false
    and deleted_at is null
    and tanggal >= make_date(p_year, p_month, 1)
    and tanggal < (make_date(p_year, p_month, 1) + interval '1 month')::date;

  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;
