create extension if not exists pgcrypto with schema extensions;

do $$
declare
  -- ============================================================
  -- SEED CONFIG
  -- ============================================================
  seed_email text := 'admin@example.com';
  seed_password text := 'Admin@1234';
  seed_name text := 'admin';

  seed_user_id uuid;
  seed_identity_id uuid;
  identity_data jsonb;
  identity_has_provider_id boolean;
  identity_id_type text;

  seed_customer_id uuid;

  product_lm_premium_id uuid;
  product_lm_standard_id uuid;
  product_br_gold_id uuid;

  bon_piutang_id uuid;
  bon_lunas_id uuid;

  existing_user boolean := false;
begin
  perform set_config('search_path', 'public, extensions, auth', true);

  if seed_email is null or btrim(seed_email) = '' then
    raise exception 'seed_email wajib diisi';
  end if;

  if length(seed_password) < 8 then
    raise exception 'seed_password minimal 8 karakter';
  end if;

  -- ============================================================
  -- 1. FIND OR CREATE AUTH USER
  --    Jika email sudah ada, pakai user itu sebagai owner_uid.
  -- ============================================================
  select id
  into seed_user_id
  from auth.users
  where lower(email) = lower(seed_email)
  limit 1;

  if seed_user_id is null then
    seed_user_id := extensions.gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      seed_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      lower(seed_email),
      crypt(seed_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', seed_name),
      now(),
      now()
    );

    existing_user := false;
  else
    existing_user := true;

    update auth.users
    set
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('name', seed_name),
      updated_at = now()
    where id = seed_user_id;
  end if;

  -- ============================================================
  -- 2. ENSURE AUTH IDENTITY
  --    Jika identity email belum ada, buat.
  --    Jika sudah ada, biarkan.
  -- ============================================================
  identity_data := jsonb_build_object(
    'sub', seed_user_id::text,
    'email', lower(seed_email),
    'email_verified', true,
    'phone_verified', false
  );

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'identities'
      and column_name = 'provider_id'
  )
  into identity_has_provider_id;

  select data_type
  into identity_id_type
  from information_schema.columns
  where table_schema = 'auth'
    and table_name = 'identities'
    and column_name = 'id';

  if not exists (
    select 1
    from auth.identities
    where user_id = seed_user_id
      and provider = 'email'
  ) then
    seed_identity_id := extensions.gen_random_uuid();

    if identity_has_provider_id then
      if identity_id_type = 'uuid' then
        execute
          'insert into auth.identities (
            id,
            user_id,
            provider_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
          )
          values ($1::uuid, $2, $3, $4, $5, now(), now(), now())'
        using seed_identity_id::text, seed_user_id, lower(seed_email), identity_data, 'email';
      else
        execute
          'insert into auth.identities (
            id,
            user_id,
            provider_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
          )
          values ($1::text, $2, $3, $4, $5, now(), now(), now())'
        using seed_identity_id::text, seed_user_id, lower(seed_email), identity_data, 'email';
      end if;
    else
      if identity_id_type = 'uuid' then
        execute
          'insert into auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
          )
          values ($1::uuid, $2, $3, $4, now(), now(), now())'
        using seed_identity_id::text, seed_user_id, identity_data, 'email';
      else
        execute
          'insert into auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
          )
          values ($1::text, $2, $3, $4, now(), now(), now())'
        using seed_identity_id::text, seed_user_id, identity_data, 'email';
      end if;
    end if;
  end if;

  -- ============================================================
  -- 3. CLEANUP SAMPLE DATA UNTUK OWNER INI
  --    Supaya query bisa dijalankan berkali-kali.
  -- ============================================================
  delete from public.transaction_lines
  where owner_uid = seed_user_id
    and transaction_id in (
      select id
      from public.transactions
      where owner_uid = seed_user_id
        and nomor_bon in (
          'BON-SEED-PIUTANG-001',
          'BON-SEED-LUNAS-001'
        )
    );

  delete from public.transactions
  where owner_uid = seed_user_id
    and nomor_bon in (
      'BON-SEED-PIUTANG-001',
      'BON-SEED-LUNAS-001'
    );

  delete from public.discount_steps
  where owner_uid = seed_user_id
    and customer_id in (
      select id
      from public.customers
      where owner_uid = seed_user_id
        and nama = 'Toko Sinar Jaya'
    );

  delete from public.customers
  where owner_uid = seed_user_id
    and nama = 'Toko Sinar Jaya';

  delete from public.products
  where owner_uid = seed_user_id
    and nama in (
      'LM Premium 1L',
      'LM Standard 500ml',
      'BR Gold Pack'
    );

  -- ============================================================
  -- 4. CUSTOMER
  -- ============================================================
  insert into public.customers (
    owner_uid,
    nama,
    bonus_threshold,
    bonuses_granted,
    deleted_at
  )
  values (
    seed_user_id,
    'Toko Sinar Jaya',
    10000000,
    0,
    null
  )
  returning id into seed_customer_id;

  insert into public.discount_steps (
    owner_uid,
    customer_id,
    product_type,
    step_order,
    percentage
  )
  values
    (seed_user_id, seed_customer_id, 'LM', 1, 20),
    (seed_user_id, seed_customer_id, 'LM', 2, 20),
    (seed_user_id, seed_customer_id, 'LM', 3, 10),
    (seed_user_id, seed_customer_id, 'BR', 1, 15),
    (seed_user_id, seed_customer_id, 'BR', 2, 5);

  -- ============================================================
  -- 5. PRODUCTS
  -- ============================================================
  insert into public.products (
    owner_uid,
    nama,
    harga_modal,
    harga_base,
    tipe,
    deleted_at
  )
  values (
    seed_user_id,
    'LM Premium 1L',
    520000,
    1000000,
    'LM',
    null
  )
  returning id into product_lm_premium_id;

  insert into public.products (
    owner_uid,
    nama,
    harga_modal,
    harga_base,
    tipe,
    deleted_at
  )
  values (
    seed_user_id,
    'LM Standard 500ml',
    260000,
    500000,
    'LM',
    null
  )
  returning id into product_lm_standard_id;

  insert into public.products (
    owner_uid,
    nama,
    harga_modal,
    harga_base,
    tipe,
    deleted_at
  )
  values (
    seed_user_id,
    'BR Gold Pack',
    180000,
    300000,
    'BR',
    null
  )
  returning id into product_br_gold_id;

  -- ============================================================
  -- 6. BON PIUTANG
  -- ============================================================
  insert into public.transactions (
    owner_uid,
    nomor_bon,
    tanggal,
    customer_id,
    ongkir,
    deskripsi,
    is_bonus,
    bonus_units,
    status,
    tanggal_lunas,
    deleted_at
  )
  values (
    seed_user_id,
    'BON-SEED-PIUTANG-001',
    current_date,
    seed_customer_id,
    50000,
    'Sample bon piutang dari seeder',
    false,
    0,
    'piutang',
    null,
    null
  )
  returning id into bon_piutang_id;

  insert into public.transaction_lines (
    owner_uid,
    transaction_id,
    product_id,
    product_type,
    harga_modal_snap,
    harga_base_snap,
    discounted_price,
    qty,
    line_omzet,
    line_laba_hl
  )
  values
    (
      seed_user_id,
      bon_piutang_id,
      product_lm_premium_id,
      'LM',
      520000,
      1000000,
      576000,
      5,
      2880000,
      280000
    ),
    (
      seed_user_id,
      bon_piutang_id,
      product_br_gold_id,
      'BR',
      180000,
      300000,
      242250,
      4,
      969000,
      249000
    );

  -- ============================================================
  -- 7. BON LUNAS
  -- ============================================================
  insert into public.transactions (
    owner_uid,
    nomor_bon,
    tanggal,
    customer_id,
    ongkir,
    deskripsi,
    is_bonus,
    bonus_units,
    status,
    tanggal_lunas,
    deleted_at
  )
  values (
    seed_user_id,
    'BON-SEED-LUNAS-001',
    current_date - interval '3 day',
    seed_customer_id,
    75000,
    'Sample bon lunas dari seeder',
    false,
    0,
    'lunas',
    current_date - interval '1 day',
    null
  )
  returning id into bon_lunas_id;

  insert into public.transaction_lines (
    owner_uid,
    transaction_id,
    product_id,
    product_type,
    harga_modal_snap,
    harga_base_snap,
    discounted_price,
    qty,
    line_omzet,
    line_laba_hl
  )
  values
    (
      seed_user_id,
      bon_lunas_id,
      product_lm_standard_id,
      'LM',
      260000,
      500000,
      288000,
      20,
      5760000,
      560000
    ),
    (
      seed_user_id,
      bon_lunas_id,
      product_br_gold_id,
      'BR',
      180000,
      300000,
      242250,
      10,
      2422500,
      622500
    );

  -- ============================================================
  -- DONE
  -- ============================================================
  if existing_user then
    raise notice 'User sudah ada, data seed memakai owner existing: %', seed_email;
    raise notice 'Password user existing tidak diubah.';
  else
    raise notice 'User baru dibuat: %', seed_email;
    raise notice 'Password: %', seed_password;
  end if;

  raise notice 'Owner UID: %', seed_user_id;
  raise notice 'Customer seed: Toko Sinar Jaya';
  raise notice 'Product seed: LM Premium 1L, LM Standard 500ml, BR Gold Pack';
  raise notice 'Bon seed: BON-SEED-PIUTANG-001, BON-SEED-LUNAS-001';
end;
$$;