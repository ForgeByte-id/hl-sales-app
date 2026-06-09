create extension if not exists pgcrypto with schema extensions;

create table public.customers (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_uid uuid not null default auth.uid(),
  nama text not null,
  bonus_threshold numeric(15, 2) not null default 0 check (bonus_threshold >= 0),
  bonuses_granted integer not null default 0 check (bonuses_granted >= 0),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.discount_steps (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_uid uuid not null default auth.uid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_type text not null check (product_type in ('LM', 'BR')),
  step_order integer not null check (step_order > 0),
  percentage numeric(5, 2) not null check (percentage >= 0 and percentage <= 100),
  unique (customer_id, product_type, step_order)
);

create table public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_uid uuid not null default auth.uid(),
  nama text not null,
  harga_modal numeric(15, 2) not null check (harga_modal >= 0),
  harga_base numeric(15, 2) not null check (harga_base >= 0),
  tipe text not null check (tipe in ('LM', 'BR')),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_uid uuid not null default auth.uid(),
  nomor_bon text not null,
  tanggal date not null default current_date,
  customer_id uuid not null references public.customers(id),
  ongkir numeric(15, 2) not null default 0 check (ongkir >= 0),
  deskripsi text,
  is_bonus boolean not null default false,
  status text not null default 'piutang' check (status in ('piutang', 'lunas')),
  tanggal_lunas date,
  created_at timestamptz not null default now(),
  unique (owner_uid, nomor_bon),
  check (
    (status = 'lunas' and tanggal_lunas is not null)
    or (status = 'piutang')
  )
);

create table public.transaction_lines (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_uid uuid not null default auth.uid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_type text not null check (product_type in ('LM', 'BR')),
  harga_modal_snap numeric(15, 2) not null check (harga_modal_snap >= 0),
  harga_base_snap numeric(15, 2) not null check (harga_base_snap >= 0),
  discounted_price numeric(15, 2) not null check (discounted_price >= 0),
  qty integer not null check (qty > 0),
  line_omzet numeric(15, 2) not null check (line_omzet >= 0),
  line_laba_hl numeric(15, 2) not null
);

create index customers_owner_active_name_idx on public.customers (owner_uid, deleted_at, nama);
create index discount_steps_customer_type_order_idx on public.discount_steps (customer_id, product_type, step_order);
create index products_owner_active_type_name_idx on public.products (owner_uid, deleted_at, tipe, nama);
create index transactions_owner_customer_date_idx on public.transactions (owner_uid, customer_id, tanggal desc);
create index transactions_owner_status_date_idx on public.transactions (owner_uid, status, tanggal desc);
create index transaction_lines_owner_transaction_idx on public.transaction_lines (owner_uid, transaction_id);
create index transaction_lines_owner_product_idx on public.transaction_lines (owner_uid, product_id);

alter table public.customers enable row level security;
alter table public.discount_steps enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_lines enable row level security;

alter table public.customers force row level security;
alter table public.discount_steps force row level security;
alter table public.products force row level security;
alter table public.transactions force row level security;
alter table public.transaction_lines force row level security;

create or replace function public.ensure_discount_step_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  parent_owner uuid;
begin
  select owner_uid into parent_owner
  from public.customers
  where id = new.customer_id;

  if parent_owner is null or parent_owner <> new.owner_uid then
    raise exception 'invalid customer reference';
  end if;

  return new;
end;
$$;

create or replace function public.ensure_transaction_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  parent_owner uuid;
begin
  select owner_uid into parent_owner
  from public.customers
  where id = new.customer_id;

  if parent_owner is null or parent_owner <> new.owner_uid then
    raise exception 'invalid customer reference';
  end if;

  return new;
end;
$$;

create or replace function public.ensure_transaction_line_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  transaction_owner uuid;
  product_owner uuid;
  product_kind text;
begin
  select owner_uid into transaction_owner
  from public.transactions
  where id = new.transaction_id;

  select owner_uid, tipe into product_owner, product_kind
  from public.products
  where id = new.product_id;

  if transaction_owner is null or transaction_owner <> new.owner_uid then
    raise exception 'invalid transaction reference';
  end if;

  if product_owner is null or product_owner <> new.owner_uid then
    raise exception 'invalid product reference';
  end if;

  if product_kind <> new.product_type then
    raise exception 'product type mismatch';
  end if;

  return new;
end;
$$;

create trigger ensure_discount_step_owner_before_write
  before insert or update on public.discount_steps
  for each row
  execute function public.ensure_discount_step_owner();

create trigger ensure_transaction_owner_before_write
  before insert or update on public.transactions
  for each row
  execute function public.ensure_transaction_owner();

create trigger ensure_transaction_line_owner_before_write
  before insert or update on public.transaction_lines
  for each row
  execute function public.ensure_transaction_line_owner();

create policy customers_owner_all on public.customers
  for all
  to authenticated
  using ((select auth.uid()) = owner_uid)
  with check ((select auth.uid()) = owner_uid);

create policy discount_steps_owner_all on public.discount_steps
  for all
  to authenticated
  using ((select auth.uid()) = owner_uid)
  with check ((select auth.uid()) = owner_uid);

create policy products_owner_all on public.products
  for all
  to authenticated
  using ((select auth.uid()) = owner_uid)
  with check ((select auth.uid()) = owner_uid);

create policy transactions_owner_all on public.transactions
  for all
  to authenticated
  using ((select auth.uid()) = owner_uid)
  with check ((select auth.uid()) = owner_uid);

create policy transaction_lines_owner_all on public.transaction_lines
  for all
  to authenticated
  using ((select auth.uid()) = owner_uid)
  with check ((select auth.uid()) = owner_uid);

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
    and tanggal >= make_date(p_year, p_month, 1)
    and tanggal < (make_date(p_year, p_month, 1) + interval '1 month')::date;

  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;

revoke execute on function public.settle_month(uuid, integer, integer, date) from public;
revoke execute on function public.ensure_discount_step_owner() from public;
revoke execute on function public.ensure_transaction_owner() from public;
revoke execute on function public.ensure_transaction_line_owner() from public;

grant execute on function public.settle_month(uuid, integer, integer, date) to authenticated;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.customers to authenticated;
grant select, insert, update, delete on table public.discount_steps to authenticated;
grant select, insert, update, delete on table public.products to authenticated;
grant select, insert, update, delete on table public.transactions to authenticated;
grant select, insert, update, delete on table public.transaction_lines to authenticated;
