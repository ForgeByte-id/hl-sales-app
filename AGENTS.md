# AGENT.md

## HL Sales & Receivables Management App — Coding Agent Instructions

**Stack:** Nuxt 3 · Tailwind CSS · Supabase  
**UI Language:** Bahasa Indonesia (all labels, messages, and copy in the app)  
**Doc Language:** English (this file and all referenced docs)  
**Single-user internal app. No multi-tenant. No PPN/tax. IDR only.**

Read this file fully before writing any code. It is the authoritative source of truth. If this file conflicts with something in chat, this file wins.

# IMPORTANT NOTES : If my prompt is ambiguous, please make sure you ask or reconfirm with me.

---

## 0. Quick Reference

| Doc                | Contents                                                                |
| ------------------ | ----------------------------------------------------------------------- |
| `system-prompt.md` | use this as reference system prompt , avoid ai slops design             |
| `SRS.md`           | All functional and non-functional requirements (AC-_._ numbered)        |
| `PRD.md`           | Product scope, feature details, UX principles, page map                 |
| `DESIGN.md`        | Visual system, components, Nuxt structure, Supabase patterns            |
| `AGENT.md`         | This file. Coding rules, task protocol, anti-patterns                   |
| `ANTI-SLOP.md`     | Writing style rules (apply when generating copy, comments, README text) |
| `SKILL-lite.md`    | Compact version of writing rules                                        |

---

## 1. Non-Negotiable Rules

These apply to every file, every function, every PR. No exceptions.

### 1.1 Calculation Correctness

The cascading discount formula is:

```ts
discounted_unit_price = base_price × ∏(1 − dᵢ/100)
```

`[20, 20, 10]` on base `100` = `100 × 0.8 × 0.8 × 0.9 = 57.6`.

This is NOT `100 × (1 - 0.50) = 50`. Any code that sums discount steps before applying them is wrong. Fix it, don't work around it.

Isolate this logic in `composables/useDiscount.ts`. No inline discount calculation anywhere else in the app.

### 1.2 Cash Basis

Omzet, Laba HL, and bonus accumulation count **only** for transactions where `status = 'lunas'`. Any query or aggregation that counts Piutang transactions in revenue figures is a bug.

### 1.3 Harga Modal is Internal

`harga_modal` and `line_laba_hl` are **never** shown in:

- Customer-facing PDFs
- Any UI element visible on the customer detail page's "download" output
- Any tooltip or hover state that a customer could see if shown the screen

They appear only in internal recap pages and the Bon detail (operator view).

### 1.4 Soft-Delete Only

Never hard-delete customers or products that have transaction history. Always use `deleted_at = now()`. Soft-deleted records:

- Are excluded from all active dropdowns and pickers
- Remain in all historical Bon data
- Are excluded from new Bon creation selectors

### 1.5 Nomor Bon Uniqueness

`nomor_bon` has a UNIQUE constraint in the database. Also validate client-side on blur. Error message: "Nomor bon sudah digunakan."

### 1.6 Ongkir is Pass-Through

`ongkir` adds to the customer's total owed (Amount Owed = omzet + ongkir). It does NOT add to Laba HL, Omzet, or bonus accumulator.

### 1.7 Atomic Batch Operations

The "settle month" operation must update ALL qualifying transactions in a single database call (Supabase RPC / PL/pgSQL function). Do not loop over transactions in JS and settle one by one.

### 1.8 Price Snapshots

When a transaction line is created, store snapshots:

- `harga_modal_snap` (copy of product's `harga_modal` at that moment)
- `harga_base_snap` (copy of `harga_base`)
- `discounted_price` (computed from snapshot + customer discounts at that moment)
- `line_omzet`, `line_laba_hl` (computed and stored)

This prevents retroactive calculation changes when product prices or customer discounts are edited later.

---

## 2. Tech Stack Specifics

### 2.1 Nuxt 3

- Use `<script setup lang="ts">` in all `.vue` files
- Use Nuxt's auto-import for composables and components
- Use `useFetch` or `useAsyncData` for server-side data fetching on pages
- Use `$fetch` for client-side mutations (form submissions)
- State management: Nuxt's built-in `useState` or Pinia for cross-page state (e.g., toast notifications, user session)
- Route middleware in `middleware/auth.global.ts` for session protection
- Server routes (`server/api/`) only when Supabase client-side is insufficient (rare)

### 2.2 Tailwind CSS

- Config file at `tailwind.config.js`. The `brand`, `piutang`, `lunas`, `bonus` color tokens defined in `DESIGN.md §2.1` must be configured there before use.
- No inline `style=""` attributes. All styling via Tailwind classes or CSS variables.
- For component variants (e.g., StatusBadge in three colors), use a props-driven class map object, not conditional class strings scattered across the template.
- `font-mono` for all IDR currency amounts in tables.
- Responsive prefix order: mobile → `sm:` → `md:` → `lg:`

### 2.3 Supabase

- Use `@supabase/supabase-js` via the Nuxt Supabase module (`@nuxtjs/supabase`)
- All table queries go through the typed Supabase client
- RLS policies must be active on all tables. Development without RLS is not acceptable.
- Use `.rpc()` for the `settle_month` function and any other multi-row atomic operations
- Supabase Realtime: disabled for v1 (no subscriptions)
- Environment variables: `SUPABASE_URL` and `SUPABASE_KEY` (anon key) in `.env`. Never commit keys.

**Type generation:** Run `supabase gen types typescript` after any schema change and commit the result to `types/supabase.ts`.

---

## 3. Database Schema

Apply these as Supabase migrations. Keep migration files in `supabase/migrations/`.

### 3.1 Tables

```sql
-- customers
CREATE TABLE customers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama            text NOT NULL,
  bonus_threshold integer NOT NULL DEFAULT 0,
  bonuses_granted integer NOT NULL DEFAULT 0,
  deleted_at      timestamptz NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- discount_steps (ordered per customer per type)
CREATE TABLE discount_steps (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_type text NOT NULL CHECK (product_type IN ('LM', 'BR')),
  step_order   integer NOT NULL,
  percentage   numeric(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  UNIQUE (customer_id, product_type, step_order)
);

-- products
CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        text NOT NULL,
  harga_modal numeric(15,2) NOT NULL CHECK (harga_modal >= 0),
  harga_base  numeric(15,2) NOT NULL CHECK (harga_base >= 0),
  tipe        text NOT NULL CHECK (tipe IN ('LM', 'BR')),
  deleted_at  timestamptz NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- transactions (bon)
CREATE TABLE transactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_bon    text NOT NULL UNIQUE,
  tanggal      date NOT NULL DEFAULT CURRENT_DATE,
  customer_id  uuid NOT NULL REFERENCES customers(id),
  ongkir       numeric(15,2) NOT NULL DEFAULT 0 CHECK (ongkir >= 0),
  deskripsi    text,
  is_bonus     boolean NOT NULL DEFAULT false,
  status       text NOT NULL DEFAULT 'piutang' CHECK (status IN ('piutang', 'lunas')),
  tanggal_lunas date NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- transaction_lines
CREATE TABLE transaction_lines (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id    uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id        uuid NOT NULL REFERENCES products(id),
  product_type      text NOT NULL CHECK (product_type IN ('LM', 'BR')),
  harga_modal_snap  numeric(15,2) NOT NULL,
  harga_base_snap   numeric(15,2) NOT NULL,
  discounted_price  numeric(15,2) NOT NULL,
  qty               integer NOT NULL CHECK (qty >= 1),
  line_omzet        numeric(15,2) NOT NULL,
  line_laba_hl      numeric(15,2) NOT NULL
);
```

### 3.2 RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_lines ENABLE ROW LEVEL SECURITY;

-- Single-user policy: allow all operations for the authenticated user
-- Replace 'YOUR_USER_UUID' with the actual user UUID after seeding auth
CREATE POLICY "owner_all" ON customers FOR ALL
  USING (auth.uid() = 'YOUR_USER_UUID'::uuid);

-- (Repeat for each table)
```

### 3.3 Supabase RPC: settle_month

```sql
CREATE OR REPLACE FUNCTION settle_month(
  p_customer_id   uuid,
  p_year          integer,
  p_month         integer,
  p_tanggal_lunas date
)
RETURNS integer AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE transactions
  SET status = 'lunas', tanggal_lunas = p_tanggal_lunas
  WHERE customer_id = p_customer_id
    AND EXTRACT(YEAR FROM tanggal)::integer = p_year
    AND EXTRACT(MONTH FROM tanggal)::integer = p_month
    AND status = 'piutang'
    AND is_bonus = false;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Returns the number of Bon settled. Use this count to show "7 bon berhasil dilunasi."

---

## 4. Composables Reference

### 4.1 `composables/useDiscount.ts`

```ts
/**
 * Calculates cascading discounted price.
 * steps: ordered array of percentages, e.g. [20, 20, 10]
 * Returns: discounted price (same unit as basePrice)
 */
export function calcDiscountedPrice(
  basePrice: number,
  steps: number[],
): number {
  if (!steps.length) return basePrice;
  return steps.reduce((price, step) => price * (1 - step / 100), basePrice);
}

/**
 * Returns effective discount percentage from cascading steps.
 * e.g. [20, 20, 10] → 42.4
 */
export function effectiveDiscountPct(steps: number[]): number {
  const discountedRatio = steps.reduce((r, step) => r * (1 - step / 100), 1);
  return (1 - discountedRatio) * 100;
}

/**
 * Human-readable chain label. e.g. [20, 20, 10] → "20-20-10"
 */
export function discountChainLabel(steps: number[]): string {
  return steps.join("-");
}
```

### 4.2 `composables/useBonusCalc.ts`

```ts
/**
 * How many bonuses the customer has available to claim.
 */
export function calcBonusesAvailable(
  accumulatedLunasOmzet: number,
  threshold: number,
  alreadyGranted: number,
): number {
  if (threshold <= 0) return 0;
  return Math.max(
    0,
    Math.floor(accumulatedLunasOmzet / threshold) - alreadyGranted,
  );
}

/**
 * How much omzet a customer has accumulated toward the next bonus.
 * Returns the remainder after consuming full bonus cycles.
 */
export function bonusRemainder(
  accumulatedLunasOmzet: number,
  threshold: number,
  alreadyGranted: number,
): number {
  if (threshold <= 0) return 0;
  const consumed = alreadyGranted * threshold;
  return accumulatedLunasOmzet - consumed;
}
```

### 4.3 `utils/currency.ts`

```ts
export function formatRp(amount: number | null | undefined): string {
  if (amount == null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseRpInput(value: string): number {
  return parseInt(value.replace(/\D/g, ""), 10) || 0;
}
```

### 4.4 `utils/date.ts`

```ts
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
  // Output: "15/06/2026"
}

export function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1));
  // Output: "Juni 2026"
}
```

---

## 5. Task Protocol

When given a coding task, follow this order. Don't skip steps.

### Step 1: Identify scope

Read the task. Map it to the relevant sections in SRS.md, PRD.md, and DESIGN.md. If the task touches calculation logic, re-read Section 4 of SRS.md (Master Calculation Reference) before writing anything.

### Step 2: Schema first

If the task needs a new table or column, write the migration SQL first. Get that right before writing any Vue or TS.

### Step 3: Composable logic before UI

If the task involves business logic (discounts, bonus calc, report aggregation), write and test the composable first as a pure function. Then wire it into the UI.

### Step 4: Build the UI

Follow DESIGN.md exactly. Use the color tokens. Use the component patterns. Write all user-visible text in Bahasa Indonesia.

### Step 5: Validate edge cases

After building, verify:

- Empty states (no transactions, no customers, no products)
- Soft-deleted items are hidden from pickers
- Nomor Bon duplicate shows the right error
- A customer with 0 discount steps gets base price (no crash)
- A customer with `bonus_threshold = 0` shows no bonus badge

### Step 6: Write types

Export TypeScript interfaces for all DB row types. Store them in `types/` (or use the Supabase-generated types).

---

## 6. Writing Standards (for code comments, README, copy)

Apply `ANTI-SLOP.md` rules to all written text in this project:

- Comments explain WHY, not WHAT (the code shows what)
- No filler phrases: no "This function handles...", no "This component is responsible for..."
- User-facing error messages in Indonesian are direct and specific: "Nomor bon sudah digunakan" not "An error occurred"
- README is plain and functional. No marketing language.
- No em dashes in comments or docs. Use commas, colons, or periods.

---

## 7. Anti-Patterns

These are bugs or design mistakes to avoid. If you see one in existing code, fix it.

| Anti-pattern                                                                 | Why it's wrong                                        | Fix                                         |
| ---------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| Summing discount percentages: `1 - (d1 + d2 + d3)/100`                       | Gives wrong effective discount                        | Use `∏(1 − dᵢ/100)`                         |
| Counting Piutang transactions in Omzet totals                                | Violates cash basis (D3)                              | Filter `WHERE status = 'lunas'`             |
| Computing `discounted_price` at read time from current product/discount data | Historical Bon would change if prices are edited      | Use stored snapshots on `transaction_lines` |
| Separate JS loop to settle each Bon individually                             | Not atomic; partial failures leave inconsistent state | Use Supabase RPC                            |
| Showing `line_laba_hl` or `harga_modal` in customer-facing PDFs              | Exposes internal cost data                            | Exclude these columns from PDF templates    |
| Using free-text input for customer or product selection in Bon form          | Breaks referential integrity                          | Enforce dropdown selection only             |
| Hard-deleting a customer or product that has transaction lines               | Breaks historical data                                | Soft-delete only                            |
| Allowing `bonuses_available` to go negative                                  | Logic error in grant flow                             | Use `Math.max(0, ...)` in calc              |
| Ongkir included in Omzet or Laba calculation                                 | Wrong accounting                                      | Omzet excludes ongkir; Laba excludes ongkir |

---

## 8. Environment Setup

```bash
# Clone and install
npm install

# Set up env
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_ANON_KEY

# Run Supabase locally (optional)
npx supabase start

# Apply migrations
npx supabase db push

# Generate TypeScript types from schema
npx supabase gen types typescript --local > types/supabase.ts

# Start dev server
npm run dev
```

---

## 9. Supabase Query Patterns

### Fetch customer with discount steps

```ts
const { data } = await supabase
  .from("customers")
  .select(
    `
    *,
    discount_steps (
      id, product_type, step_order, percentage
    )
  `,
  )
  .eq("id", customerId)
  .is("deleted_at", null)
  .single();

// Sort discount steps client-side after fetch
const lmSteps = data.discount_steps
  .filter((s) => s.product_type === "LM")
  .sort((a, b) => a.step_order - b.step_order)
  .map((s) => s.percentage);
```

### Fetch bonus accumulator for a customer

```ts
const { data } = await supabase
  .from("transactions")
  .select("id, transaction_lines(line_omzet)")
  .eq("customer_id", customerId)
  .eq("status", "lunas")
  .eq("is_bonus", false);

const accumulator = data.reduce(
  (sum, tx) => sum + tx.transaction_lines.reduce((s, l) => s + l.line_omzet, 0),
  0,
);
```

### Settle a month

```ts
const { data, error } = await supabase.rpc("settle_month", {
  p_customer_id: customerId,
  p_year: year,
  p_month: month,
  p_tanggal_lunas: tanggalLunas,
});
// data = number of Bon settled
```

### Recap query (monthly breakdown, one customer)

```ts
const { data } = await supabase
  .from("transactions")
  .select(
    `
    tanggal,
    ongkir,
    status,
    is_bonus,
    transaction_lines (
      product_type,
      line_omzet,
      line_laba_hl
    )
  `,
  )
  .eq("customer_id", customerId)
  .gte("tanggal", `${year}-01-01`)
  .lte("tanggal", `${year}-12-31`)
  .order("tanggal", { ascending: true });
```

Aggregate the results in `useReportCalc.ts`, not in the query. Keep queries simple and composable.

---

## 10. PDF Export Implementation

Use `html2pdf.js` (browser-side, no server needed).

```ts
// composables/usePdfExport.ts
import html2pdf from "html2pdf.js";

export function usePdfExport() {
  function exportToPdf(element: HTMLElement, filename: string) {
    html2pdf(element, {
      margin: [10, 10, 15, 10], // mm: top, right, bottom, left
      filename,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    });
  }

  return { exportToPdf };
}
```

The template to export is a hidden `<div ref="pdfTarget">` in the page. It mirrors the on-screen table but excludes Laba HL and Harga Modal from customer PDFs.

PDF filename pattern: `HL-[report-type]-[customer-name]-[period].pdf`  
Example: `HL-piutang-budi-santoso-juni-2026.pdf`

---

## 11. Component Checklist

Before marking a component done, verify:

- All user-visible text is in Bahasa Indonesia
- Currency amounts use `formatRp()` from `utils/currency.ts`
- Dates use `formatDate()` or `monthLabel()` from `utils/date.ts`
- IDR amounts in tables use `font-mono` class
- Loading state handled (skeleton or spinner)
- Empty state handled ("Belum ada data")
- Error state handled (inline or toast)
- Mobile layout tested at 375px width
- `harga_modal` and `line_laba_hl` are NOT exposed in customer-facing outputs
