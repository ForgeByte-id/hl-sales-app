import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const migrationSql = readFileSync('supabase/migrations/20260609000000_init_hl_schema.sql', 'utf8')

describe('initial database migration contract', () => {
  it.each(['customers', 'discount_steps', 'products', 'transactions', 'transaction_lines'])(
    'creates %s with row level security and owner policies',
    (tableName) => {
      expect(migrationSql).toContain(`create table public.${tableName}`)
      expect(migrationSql).toContain(`alter table public.${tableName} enable row level security`)
      expect(migrationSql).toContain(`alter table public.${tableName} force row level security`)
      expect(migrationSql).toContain(`create policy ${tableName}_owner_all on public.${tableName}`)
      expect(migrationSql).toContain('using ((select auth.uid()) = owner_uid)')
      expect(migrationSql).toContain('with check ((select auth.uid()) = owner_uid)')
    },
  )

  it('keeps customer and product deletes as soft-delete capable', () => {
    expect(migrationSql).toMatch(/create table public\.customers[\s\S]*deleted_at timestamptz/)
    expect(migrationSql).toMatch(/create table public\.products[\s\S]*deleted_at timestamptz/)
  })

  it('enforces product and transaction CRUD constraints used by forms', () => {
    expect(migrationSql).toContain("tipe text not null check (tipe in ('LM', 'BR'))")
    expect(migrationSql).toContain("product_type text not null check (product_type in ('LM', 'BR'))")
    expect(migrationSql).toContain('harga_modal numeric(15, 2) not null check (harga_modal >= 0)')
    expect(migrationSql).toContain('harga_base numeric(15, 2) not null check (harga_base >= 0)')
    expect(migrationSql).toContain("status text not null default 'piutang' check (status in ('piutang', 'lunas'))")
    expect(migrationSql).toContain('unique (owner_uid, nomor_bon)')
  })

  it('keeps monthly settlement as an authenticated owner-scoped function', () => {
    expect(migrationSql).toContain('create or replace function public.settle_month')
    expect(migrationSql).toContain('security invoker')
    expect(migrationSql).toContain('where owner_uid = (select auth.uid())')
    expect(migrationSql).toContain("and status = 'piutang'")
    expect(migrationSql).toContain("set\n    status = 'lunas'")
    expect(migrationSql).toContain('grant execute on function public.settle_month(uuid, integer, integer, date) to authenticated')
  })
})
