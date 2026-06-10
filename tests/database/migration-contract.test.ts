import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readdirSync("supabase/migrations")
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(`supabase/migrations/${file}`, "utf8"))
  .join("\n");

describe("initial database migration contract", () => {
  it.each([
    "customers",
    "discount_steps",
    "products",
    "transactions",
    "transaction_lines",
  ])("creates %s with row level security and owner policies", (tableName) => {
    expect(migrationSql).toContain(`create table public.${tableName}`);
    expect(migrationSql).toContain(
      `alter table public.${tableName} enable row level security`,
    );
    expect(migrationSql).toContain(
      `alter table public.${tableName} force row level security`,
    );
    expect(migrationSql).toContain(
      `create policy ${tableName}_owner_all on public.${tableName}`,
    );
    expect(migrationSql).toContain("using ((select auth.uid()) = owner_uid)");
    expect(migrationSql).toContain(
      "with check ((select auth.uid()) = owner_uid)",
    );
  });

  it("keeps customer and product deletes as soft-delete capable", () => {
    expect(migrationSql).toMatch(
      /create table public\.customers[\s\S]*deleted_at timestamptz/,
    );
    expect(migrationSql).toMatch(
      /create table public\.products[\s\S]*deleted_at timestamptz/,
    );
  });

  it("enforces product and transaction CRUD constraints used by forms", () => {
    expect(migrationSql).toContain(
      "tipe text not null check (tipe in ('LM', 'BR'))",
    );
    expect(migrationSql).toContain(
      "product_type text not null check (product_type in ('LM', 'BR'))",
    );
    expect(migrationSql).toContain(
      "harga_modal numeric(15, 2) not null check (harga_modal >= 0)",
    );
    expect(migrationSql).toContain(
      "harga_base numeric(15, 2) not null check (harga_base >= 0)",
    );
    expect(migrationSql).toContain(
      "status text not null default 'piutang' check (status in ('piutang', 'lunas'))",
    );
    expect(migrationSql).toContain("unique (owner_uid, nomor_bon)");
    expect(migrationSql).toContain(
      "add constraint transactions_nomor_bon_key unique (nomor_bon)",
    );
  });

  it("keeps monthly settlement as an authenticated owner-scoped function", () => {
    expect(migrationSql).toContain(
      "create or replace function public.settle_month",
    );
    expect(migrationSql).toContain("security invoker");
    expect(migrationSql).toContain("where owner_uid = (select auth.uid())");
    expect(migrationSql).toContain("and status = 'piutang'");
    expect(migrationSql).toContain("and is_bonus = false");
    expect(migrationSql).toContain("and deleted_at is null");
    expect(migrationSql).toContain("set\n    status = 'lunas'");
    expect(migrationSql).toContain(
      "grant execute on function public.settle_month(uuid, integer, integer, date) to authenticated",
    );
  });

  it("saves transactions and lines through an authenticated atomic RPC", () => {
    expect(migrationSql).toContain(
      "create or replace function public.save_transaction",
    );
    expect(migrationSql).toContain("returns uuid");
    expect(migrationSql).toContain("bonus_units integer not null default 0");
    expect(migrationSql).toContain(
      "add column if not exists deleted_at timestamptz",
    );
    expect(migrationSql).toContain("insert into public.transactions");
    expect(migrationSql).toContain("insert into public.transaction_lines");
    expect(migrationSql).toContain("delete from public.transaction_lines");
    expect(migrationSql).toContain(
      "grant execute on function public.save_transaction",
    );
  });

  it("keeps bonus delete lifecycle inside an authenticated RPC", () => {
    expect(migrationSql).toContain(
      "create or replace function public.delete_transaction",
    );
    expect(migrationSql).toContain(
      "set bonuses_granted = greatest(0, bonuses_granted - deleted_bonus_units)",
    );
    expect(migrationSql).toContain("set deleted_at = now()");
    expect(migrationSql).toContain(
      "grant execute on function public.delete_transaction(uuid) to authenticated",
    );
  });

  it("saves customers and discount steps through an authenticated atomic RPC", () => {
    expect(migrationSql).toContain(
      "create or replace function public.save_customer",
    );
    expect(migrationSql).toContain("returns uuid");
    expect(migrationSql).toContain("delete from public.discount_steps");
    expect(migrationSql).toContain(
      "grant execute on function public.save_customer(uuid, text, numeric, numeric[], numeric[]) to authenticated",
    );
  });

  it("settles a single Bon through an owner-scoped RPC", () => {
    expect(migrationSql).toContain(
      "create or replace function public.settle_transaction",
    );
    expect(migrationSql).toContain("returns boolean");
    expect(migrationSql).toContain("and owner_uid = (select auth.uid())");
    expect(migrationSql).toContain("and status = 'piutang'");
    expect(migrationSql).toContain("and is_bonus = false");
    expect(migrationSql).toContain(
      "grant execute on function public.settle_transaction(uuid, date) to authenticated",
    );
  });

  it("adds security-invoker report views for recap pages", () => {
    expect(migrationSql).toContain(
      "create or replace view public.report_transaction_lines",
    );
    expect(migrationSql).toContain("with (security_invoker = true)");
    expect(migrationSql).toContain(
      "create or replace view public.monthly_report_totals",
    );
    expect(migrationSql).toContain(
      "grant select on public.report_transaction_lines to authenticated",
    );
    expect(migrationSql).toContain(
      "grant select on public.monthly_report_totals to authenticated",
    );
  });
});
