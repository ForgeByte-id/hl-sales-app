import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const seedSql = readFileSync('supabase/seed.sql', 'utf8')

describe('user seed SQL contract', () => {
  it('creates an email identity with email as provider_id', () => {
    expect(seedSql).toContain('seed_identity_id := extensions.gen_random_uuid()')
    expect(seedSql).toContain("delete from auth.identities\n  where user_id = seed_user_id\n    and provider = 'email'")
    expect(seedSql).toContain("using seed_identity_id::text, seed_user_id, seed_email, identity_data, 'email'")
  })

  it('keeps the email user confirmed and password encrypted', () => {
    expect(seedSql).toContain('email_confirmed_at')
    expect(seedSql).toContain("encrypted_password = crypt(seed_password, gen_salt('bf'))")
    expect(seedSql).toContain("'authenticated'")
  })
})
