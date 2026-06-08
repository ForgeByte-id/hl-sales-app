# AGENTS.md

## HL Sales & Receivables Management App

Modern coding agent instructions for building and maintaining the HL Sales & Receivables Management App.

**Stack:** Nuxt 3, TypeScript, Tailwind CSS, Supabase  
**UI language:** Bahasa Indonesia  
**Documentation language:** English  
**Business model:** Single-user internal app, no multi-tenant, no PPN/tax, IDR only

This file is the main operating guide for AI coding agents. Read it before changing code. When this file conflicts with chat instructions, follow this file unless the project owner explicitly says otherwise.

---

## 1. Operating Principles

Build the app like a real internal business tool, not a demo.

1. **Make it easy for non-technical users.** End users may be unfamiliar with software, accounting terms, or complex dashboards. Use simple flows, clear labels, and safe defaults.
2. **Protect accounting correctness.** Discount, omzet, laba, piutang, lunas, bonus, and ongkir rules must never be approximated.
3. **Keep UI polished and purposeful.** Avoid generic AI-looking layouts, excessive gradients, meaningless icons, over-decorated cards, and vague empty states.
4. **Prefer clarity over cleverness.** Code should be readable, typed, and predictable.
5. **Ask only when ambiguity blocks correctness.** If the task is small and the expected behavior is clear from PRD/SRS/DESIGN, proceed.
6. **Schema first, logic second, UI last.** Data correctness comes before screens.

---

## 2. Source of Truth

Use these documents together. Do not rely on chat memory alone.

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Agent workflow, rules, guardrails, coding protocol |
| `PRD.md` | Product scope, users, goals, page map, UX behavior |
| `SRS.md` | Functional and non-functional requirements, acceptance criteria |
| `DESIGN.md` | Visual system, layout rules, components, interaction patterns |
| `system-prompt.md` | Design and implementation mindset, anti AI-slop direction |
| `ANTI-SLOP.md` | Writing style for UI copy, docs, comments, README text |
| `SKILL-lite.md` | Compact writing and implementation reminders |
| `.agents/skills/*/SKILL.md` | Specialized implementation instructions for agents |

When implementing a feature:

1. Read the related section in `PRD.md`.
2. Confirm acceptance criteria in `SRS.md`.
3. Match layout and components from `DESIGN.md`.
4. Apply relevant `.agents/skills` before coding.
5. Update types, tests, and docs when the behavior changes.

---

## 3. Required Agent Skills

The project uses local skills stored in `.agents/skills`. Before coding, inspect the relevant skill and follow it.

### 3.1 Hallmark Skill

Use the Hallmark skill as the quality gate for product feel.

Apply Hallmark whenever work touches:

- Dashboard layout
- Forms
- Tables
- Empty states
- Toasts and validation messages
- PDF export views
- Customer-facing output
- Any screen used by non-technical users

Hallmark expectations:

- The screen has one clear primary action.
- The user can understand what to do in under 5 seconds.
- Labels use familiar Indonesian words, not developer terms.
- Important totals are visually prioritized.
- Dangerous actions need confirmation and clear consequences.
- Empty states explain what happened and what to do next.
- The UI feels handmade and intentional, not generated.

### 3.2 `.agents/skills` Usage Protocol

Before making changes, check available skills:

```bash
ls .agents/skills
```

Then read the relevant `SKILL.md` file, for example:

```bash
cat .agents/skills/hallmark/SKILL.md
cat .agents/skills/design-system-generator/SKILL.md
cat .agents/skills/nuxt/SKILL.md
cat .agents/skills/supabase/SKILL.md
```

If a skill exists for the task area, use it. If no exact skill exists, use the closest one and follow this `AGENTS.md` file as the final authority.

### 3.3 Skill Application Checklist

Before marking a task complete, mention which skills were applied in the final response:

```md
Applied skills:
- Hallmark
- Design System
- Supabase
```

Do not invent skills that do not exist in `.agents/skills`.

---

## 4. Product UX Direction

This app is for daily sales and receivables work. It must feel calm, fast, and safe.

### 4.1 End User Profile

Assume the user:

- Wants to create Bon quickly.
- May not understand technical database terms.
- Needs clear difference between `Piutang` and `Lunas`.
- Needs reassurance before settling or deleting data.
- May use a small laptop or mobile device.
- Prefers direct Indonesian copy.

### 4.2 UX Rules

Use these rules on every screen:

- Use Bahasa Indonesia for all visible UI text.
- Use short labels: `Pelanggan`, `Produk`, `Bon`, `Piutang`, `Lunas`, `Bonus`.
- Avoid raw database names in UI, such as `customer_id`, `line_omzet`, `deleted_at`.
- Put primary action in the top-right on desktop and full-width sticky/action area on mobile when needed.
- Show confirmation for destructive or bulk actions.
- Format all money as IDR using `formatRp()`.
- Show dates with `formatDate()` or `monthLabel()`.
- Never show empty tables without explanation.
- Use helpful microcopy below complex fields.
- Keep forms grouped by user intent, not database table structure.

### 4.3 Anti AI-Slop UI Rules

Avoid:

- Random glassmorphism, neon gradients, and meaningless background blobs.
- Too many cards with the same visual weight.
- Generic dashboard hero sections that do not help the task.
- Placeholder copy like `Manage your data efficiently`.
- Overuse of emoji or decorative icons.
- Vague buttons like `Submit`, `Process`, `Continue` when a specific action exists.
- Dense tables with no search, filter, or summary.

Prefer:

- Clear page title plus one-sentence context.
- Strong hierarchy: summary first, detail second.
- Compact tables with search and status filters.
- Inline validation near the field.
- Plain Indonesian messages.
- Consistent spacing, rounded corners, borders, and shadows from `DESIGN.md`.

---

## 5. Non-Negotiable Business Rules

These rules apply to every PR. Violating them is a bug.

### 5.1 Cascading Discount Calculation

Discounts are applied step by step.

```ts
discounted_unit_price = base_price × ∏(1 - dᵢ / 100)
```

Example:

```ts
// base: 100
// steps: [20, 20, 10]
100 * 0.8 * 0.8 * 0.9 // 57.6
```

Do not sum discounts first. This is wrong:

```ts
100 * (1 - 0.5) // 50, incorrect
```

All discount logic must live in `composables/useDiscount.ts`. No inline discount calculation in pages or components.

### 5.2 Cash Basis

`Omzet`, `Laba HL`, and bonus accumulation count only transactions where:

```sql
status = 'lunas'
```

Transactions with `status = 'piutang'` must not affect revenue, profit, or bonus accumulation.

### 5.3 Internal Cost Protection

Never expose these fields in customer-facing outputs:

- `harga_modal`
- `harga_modal_snap`
- `line_laba_hl`

They may appear only in internal recap pages and operator-only Bon detail screens.

### 5.4 Soft Delete

Never hard-delete customers or products that have transaction history.

Use:

```sql
deleted_at = now()
```

Soft-deleted records:

- Stay visible in historical Bon data.
- Are hidden from active selectors and new Bon forms.
- Are excluded from active customer/product lists.

### 5.5 Nomor Bon Uniqueness

`nomor_bon` must be unique in the database and validated on blur in the UI.

Error message:

```text
Nomor bon sudah digunakan.
```

### 5.6 Ongkir is Pass-Through

`ongkir` increases the amount the customer owes, but does not count as:

- Omzet
- Laba HL
- Bonus accumulator

### 5.7 Atomic Settle Month

The settle month operation must update all qualifying Bon in one Supabase RPC call.

Do not loop in JavaScript and update one row at a time.

### 5.8 Price Snapshots

When creating transaction lines, store snapshots:

- `harga_modal_snap`
- `harga_base_snap`
- `discounted_price`
- `line_omzet`
- `line_laba_hl`

Historical Bon must not change when product prices or customer discounts are edited later.

---

## 6. Tech Stack Rules

### 6.1 Nuxt 3 and TypeScript

- Use `<script setup lang="ts">` for all Vue files.
- Use Nuxt auto-imports for composables and components.
- Use `useFetch` or `useAsyncData` for page-level data loading.
- Use `$fetch` for client-side mutations.
- Use typed props and emits.
- Avoid `any`. Use generated Supabase types or local interfaces.
- Use middleware in `middleware/auth.global.ts` for auth protection.
- Use server routes only when client-side Supabase is insufficient.

### 6.2 Tailwind CSS

- Configure all tokens from `DESIGN.md` in `tailwind.config.js`.
- No inline `style=""` unless there is no reasonable Tailwind alternative.
- Use props-driven class maps for component variants.
- Use `font-mono` for IDR values in tables.
- Use responsive classes from mobile to desktop: base, `sm:`, `md:`, `lg:`.
- Keep spacing consistent. Do not invent one-off spacing patterns.

### 6.3 Supabase

- Use `@nuxtjs/supabase` and the typed Supabase client.
- Keep RLS enabled on every table.
- Use `.rpc()` for multi-row atomic operations.
- Supabase Realtime is disabled for v1.
- Never commit real Supabase keys.
- Store environment values in `.env` or `.env.local` only.

Expected env names:

```bash
SUPABASE_URL=
SUPABASE_KEY=
```

After every schema change:

```bash
supabase gen types typescript --local > types/supabase.ts
```

---

## 7. Database Schema Reference

Keep migrations in `supabase/migrations/`. Use `gen_random_uuid()` for database UUIDs and a small helper for client-side temporary IDs when needed.

### 7.1 Tables

```sql
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  bonus_threshold integer NOT NULL DEFAULT 0,
  bonuses_granted integer NOT NULL DEFAULT 0,
  deleted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE discount_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_type text NOT NULL CHECK (product_type IN ('LM', 'BR')),
  step_order integer NOT NULL,
  percentage numeric(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  UNIQUE (customer_id, product_type, step_order)
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  harga_modal numeric(15,2) NOT NULL CHECK (harga_modal >= 0),
  harga_base numeric(15,2) NOT NULL CHECK (harga_base >= 0),
  tipe text NOT NULL CHECK (tipe IN ('LM', 'BR')),
  deleted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_bon text NOT NULL UNIQUE,
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  customer_id uuid NOT NULL REFERENCES customers(id),
  ongkir numeric(15,2) NOT NULL DEFAULT 0 CHECK (ongkir >= 0),
  deskripsi text,
  is_bonus boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'piutang' CHECK (status IN ('piutang', 'lunas')),
  tanggal_lunas date NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transaction_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  product_type text NOT NULL CHECK (product_type IN ('LM', 'BR')),
  harga_modal_snap numeric(15,2) NOT NULL,
  harga_base_snap numeric(15,2) NOT NULL,
  discounted_price numeric(15,2) NOT NULL,
  qty integer NOT NULL CHECK (qty >= 1),
  line_omzet numeric(15,2) NOT NULL,
  line_laba_hl numeric(15,2) NOT NULL
);
```

### 7.2 RLS

RLS must be enabled on all tables.

```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_lines ENABLE ROW LEVEL SECURITY;
```

Use a single-user owner policy for authenticated access. Replace the placeholder with the actual authenticated user UUID during setup.

```sql
CREATE POLICY "owner_all" ON customers
FOR ALL
USING (auth.uid() = 'YOUR_USER_UUID'::uuid)
WITH CHECK (auth.uid() = 'YOUR_USER_UUID'::uuid);
```

Repeat the policy for each table.

### 7.3 RPC: Settle Month

```sql
CREATE OR REPLACE FUNCTION settle_month(
  p_customer_id uuid,
  p_year integer,
  p_month integer,
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

Success copy example:

```text
7 bon berhasil dilunasi.
```

---

## 8. Required Utilities and Composables

### 8.1 `composables/useDiscount.ts`

```ts
export function calcDiscountedPrice(basePrice: number, steps: number[]): number {
  if (!steps.length) return basePrice;
  return steps.reduce((price, step) => price * (1 - step / 100), basePrice);
}

export function effectiveDiscountPct(steps: number[]): number {
  const discountedRatio = steps.reduce((ratio, step) => ratio * (1 - step / 100), 1);
  return (1 - discountedRatio) * 100;
}

export function discountChainLabel(steps: number[]): string {
  return steps.length ? steps.join('-') : 'Tanpa diskon';
}
```

### 8.2 `composables/useBonusCalc.ts`

```ts
export function calcBonusesAvailable(
  accumulatedLunasOmzet: number,
  threshold: number,
  alreadyGranted: number,
): number {
  if (threshold <= 0) return 0;
  return Math.max(0, Math.floor(accumulatedLunasOmzet / threshold) - alreadyGranted);
}

export function bonusRemainder(
  accumulatedLunasOmzet: number,
  threshold: number,
  alreadyGranted: number,
): number {
  if (threshold <= 0) return 0;
  const consumed = alreadyGranted * threshold;
  return Math.max(0, accumulatedLunasOmzet - consumed);
}
```

### 8.3 `utils/currency.ts`

```ts
export function formatRp(amount: number | null | undefined): string {
  if (amount == null) return 'Rp 0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseRpInput(value: string): number {
  return Number.parseInt(value.replace(/\D/g, ''), 10) || 0;
}
```

### 8.4 `utils/date.ts`

```ts
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1));
}
```

### 8.5 `utils/id.ts`

Use this only for temporary client-side keys, form rows, and optimistic UI. Database IDs must still use Supabase UUID defaults.

```ts
export function createTempId(prefix = 'tmp'): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
```

---

## 9. Task Workflow

Follow this order for every coding task.

### Step 1: Understand Scope

Identify:

- Which user flow changes.
- Which PRD/SRS acceptance criteria apply.
- Which `.agents/skills` apply.
- Whether schema, business logic, UI, or PDF output is affected.

### Step 2: Update Schema First

If the task needs a new table, column, index, policy, or RPC, create the migration first.

### Step 3: Implement Pure Logic

For calculation tasks, implement composables first and keep them testable.

Examples:

- `useDiscount.ts`
- `useBonusCalc.ts`
- `useReportCalc.ts`

### Step 4: Build UI with Design System

Use existing components and patterns from `DESIGN.md`. Do not create a new visual language for one page.

### Step 5: Validate Edge Cases

Check:

- Empty data
- Loading states
- Error states
- Duplicate Nomor Bon
- Customer with no discount
- Customer with `bonus_threshold = 0`
- Soft-deleted records hidden from selectors
- Mobile width at 375px
- PDF output does not leak internal cost fields

### Step 6: Final Response

When done, summarize:

- What changed
- Files changed
- Skills applied
- Tests or checks run
- Any known limitations

Keep the final response concise and factual.

---

## 10. UI Component Standards

### 10.1 Core Components

Prefer reusable components for:

- `AppButton`
- `AppInput`
- `AppSelect`
- `AppTextarea`
- `AppModal`
- `AppConfirmDialog`
- `StatusBadge`
- `SummaryCard`
- `DataTable`
- `EmptyState`
- `PageHeader`
- `FormSection`
- `CurrencyInput`
- `DateInput`
- `Toast`

### 10.2 Forms

Forms must be simple for non-technical users.

Rules:

- Group fields into sections.
- Put required fields first.
- Use clear helper text for discount, bonus, and ongkir.
- Validate before submit.
- Show field-level errors.
- Disable submit while saving.
- Use action labels that describe the result.

Good buttons:

```text
Simpan Pelanggan
Buat Bon
Lunasi Bulan Ini
Unduh PDF
```

Avoid:

```text
Submit
Process
OK
Execute
```

### 10.3 Tables

Every important table should include:

- Search when rows can exceed 10.
- Status filter when data has `Piutang` and `Lunas`.
- Empty state.
- Loading state.
- Mobile-friendly stacked layout or horizontal scroll.
- Right-aligned IDR columns with `font-mono`.

### 10.4 Dashboard

Dashboard must answer the user's daily questions quickly:

- Berapa piutang saat ini?
- Bon mana yang belum lunas?
- Pelanggan mana yang perlu ditagih?
- Bonus apa yang sudah bisa diberikan?
- Bagaimana performa bulan ini?

Avoid vanity metrics that do not support decisions.

---

## 11. Supabase Query Patterns

### 11.1 Fetch Customer with Discount Steps

```ts
const { data, error } = await supabase
  .from('customers')
  .select(`
    *,
    discount_steps (
      id,
      product_type,
      step_order,
      percentage
    )
  `)
  .eq('id', customerId)
  .is('deleted_at', null)
  .single();

if (error) throw error;

const lmSteps = [...(data.discount_steps ?? [])]
  .filter((step) => step.product_type === 'LM')
  .sort((a, b) => a.step_order - b.step_order)
  .map((step) => Number(step.percentage));
```

### 11.2 Fetch Bonus Accumulator

```ts
const { data, error } = await supabase
  .from('transactions')
  .select('id, transaction_lines(line_omzet)')
  .eq('customer_id', customerId)
  .eq('status', 'lunas')
  .eq('is_bonus', false);

if (error) throw error;

const accumulator = (data ?? []).reduce((total, transaction) => {
  const lineTotal = transaction.transaction_lines.reduce(
    (sum, line) => sum + Number(line.line_omzet),
    0,
  );

  return total + lineTotal;
}, 0);
```

### 11.3 Settle Month

```ts
const { data, error } = await supabase.rpc('settle_month', {
  p_customer_id: customerId,
  p_year: year,
  p_month: month,
  p_tanggal_lunas: tanggalLunas,
});

if (error) throw error;
```

### 11.4 Yearly Recap Query

```ts
const { data, error } = await supabase
  .from('transactions')
  .select(`
    tanggal,
    ongkir,
    status,
    is_bonus,
    transaction_lines (
      product_type,
      line_omzet,
      line_laba_hl
    )
  `)
  .eq('customer_id', customerId)
  .gte('tanggal', `${year}-01-01`)
  .lte('tanggal', `${year}-12-31`)
  .order('tanggal', { ascending: true });

if (error) throw error;
```

Aggregate reporting data in `useReportCalc.ts`, not directly in components.

---

## 12. PDF Export

Use browser-side export with `html2pdf.js`.

```ts
import html2pdf from 'html2pdf.js';

export function usePdfExport() {
  function exportToPdf(element: HTMLElement, filename: string) {
    return html2pdf(element, {
      margin: [10, 10, 15, 10],
      filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    });
  }

  return { exportToPdf };
}
```

PDF rules:

- Use a hidden `ref="pdfTarget"` template.
- Mirror the visible table, but remove internal fields.
- Never include `harga_modal`, `harga_modal_snap`, or `line_laba_hl` in customer-facing PDF.
- Use clean A4 portrait layout.
- Use readable font size and spacing.

Filename format:

```text
HL-[report-type]-[customer-name]-[period].pdf
```

Example:

```text
HL-piutang-budi-santoso-juni-2026.pdf
```

---

## 13. Writing Standards

Apply `ANTI-SLOP.md` for UI copy, comments, README, and docs.

### 13.1 UI Copy

Good:

```text
Belum ada bon untuk bulan ini.
Nomor bon sudah digunakan.
Pilih pelanggan terlebih dahulu.
7 bon berhasil dilunasi.
```

Avoid:

```text
No data available.
An error occurred.
Invalid input.
Operation completed successfully.
```

### 13.2 Comments

Comments explain why, not what.

Good:

```ts
// Snapshot prevents historical Bon totals from changing after price edits.
```

Avoid:

```ts
// Set discounted price variable.
```

### 13.3 Documentation

Docs must be plain, direct, and useful. No marketing tone. No filler.

---

## 14. Anti-Patterns

| Anti-pattern | Why it is wrong | Required fix |
| --- | --- | --- |
| Summing discount percentages | Cascading discount becomes incorrect | Use `calcDiscountedPrice()` |
| Counting `piutang` in omzet | Violates cash basis | Filter `status = 'lunas'` |
| Calculating historical prices at read time | Past Bon changes after price edits | Store and read snapshots |
| Settling Bon in a JS loop | Non-atomic and can partially fail | Use `settle_month` RPC |
| Showing `harga_modal` in customer PDFs | Leaks internal cost data | Remove from PDF template |
| Free-text customer/product input | Breaks data integrity | Use selected records only |
| Hard-deleting used customer/product | Breaks historical records | Use soft delete |
| Bonus count below zero | Incorrect grant state | Use `Math.max(0, value)` |
| Ongkir included in laba or omzet | Wrong accounting | Treat ongkir as pass-through |
| Generic AI dashboard cards | Poor usability | Use task-based summaries |

---

## 15. Environment Setup

```bash
npm install
cp .env.example .env
npx supabase start
npx supabase db push
npx supabase gen types typescript --local > types/supabase.ts
npm run dev
```

`.env.example`:

```bash
SUPABASE_URL=
SUPABASE_KEY=
```

Do not commit real credentials.

---

## 16. Completion Checklist

Before saying a task is done, verify:

- Business rules still match this file.
- All UI copy is Bahasa Indonesia.
- Money uses `formatRp()`.
- Dates use `formatDate()` or `monthLabel()`.
- Tables have search/filter when needed.
- Forms have field-level validation.
- Empty, loading, and error states exist.
- Mobile layout works at 375px.
- RLS remains enabled.
- Types are regenerated after schema changes.
- PDF output does not expose internal costs.
- Relevant `.agents/skills` were applied.
- The result does not look like generic AI-generated UI.

---

## 17. Agent Final Response Template

Use this format after completing code work:

```md
Done.

Changed:
- ...
- ...

Checks:
- ...

Applied skills:
- Hallmark
- ...

Notes:
- ...
```

Keep it short. Do not include long explanations unless asked.
