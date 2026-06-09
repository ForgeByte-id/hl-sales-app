create extension if not exists pgcrypto with schema extensions;

do $$
declare
  seed_email text := 'owner@example.com';
  seed_password text := 'change-me-12345';
  seed_name text := 'Pemilik';
  seed_user_id uuid;
  seed_identity_id uuid;
  identity_data jsonb;
  identity_has_provider_id boolean;
  identity_id_type text;
begin
  perform set_config('search_path', 'public, extensions, auth', true);

  if seed_email = 'owner@example.com' then
    raise exception 'Ganti seed_email sebelum menjalankan seed.sql';
  end if;

  if length(seed_password) < 8 then
    raise exception 'seed_password minimal 8 karakter';
  end if;

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
      seed_email,
      crypt(seed_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', seed_name),
      now(),
      now()
    );
  else
    update auth.users
    set
      encrypted_password = crypt(seed_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object('name', seed_name),
      updated_at = now()
    where id = seed_user_id;
  end if;

  identity_data := jsonb_build_object(
    'sub', seed_user_id::text,
    'email', seed_email,
    'email_verified', true,
    'phone_verified', false
  );
  seed_identity_id := extensions.gen_random_uuid();

  delete from auth.identities
  where user_id = seed_user_id
    and provider = 'email';

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

  if identity_has_provider_id then
    if identity_id_type = 'uuid' then
      execute
        'insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
         values ($1::uuid, $2, $3, $4, $5, now(), now(), now())'
      using seed_identity_id::text, seed_user_id, seed_email, identity_data, 'email';
    else
      execute
        'insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
         values ($1::text, $2, $3, $4, $5, now(), now(), now())'
      using seed_identity_id::text, seed_user_id, seed_email, identity_data, 'email';
    end if;
  else
    if identity_id_type = 'uuid' then
      execute
        'insert into auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
         values ($1::uuid, $2, $3, $4, now(), now(), now())'
      using seed_identity_id::text, seed_user_id, identity_data, 'email';
    else
      execute
        'insert into auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
         values ($1::text, $2, $3, $4, now(), now(), now())'
      using seed_identity_id::text, seed_user_id, identity_data, 'email';
    end if;
  end if;

  raise notice 'User awal siap dipakai: %', seed_email;
end;
$$;
