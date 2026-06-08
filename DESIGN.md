# Design Document

## HL Sales & Receivables Management App

**Version:** 1.0  
**Stack:** Nuxt 3 · Tailwind CSS · Supabase  
**UI Language:** Bahasa Indonesia  
**Target:** Desktop-first, mobile-accessible (Responsive)

---

## 1. Design Philosophy

Three words: fast, readable, trustworthy.

Fast because the operator creates Bon constantly. Every extra click or slow render compounds across hundreds of transactions per year. Readable because the numbers (Rp amounts, omzet totals, Piutang balances) are the whole point, and they need to be scannable in a glance. Trustworthy because this app handles real money and the operator needs to feel confident the calculations are right.

The app is not a showcase product. It's a work tool. Ornament is waste.

---

## 2. Visual Identity

### 2.1 Color System (Tailwind config)

```js
// tailwind.config.js
colors: {
  brand: {
    50:  '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',   // primary action buttons
    600: '#0284c7',   // hover state
    700: '#0369a1',   // active/pressed
  },
  piutang: {
    bg:   '#fef3c7',  // amber-100: Piutang status background
    text: '#92400e',  // amber-800: Piutang status text
    dot:  '#f59e0b',  // amber-400: status dot
    dark: {
      bg:   '#451a03',
      text: '#fde68a',
      dot:  '#fbbf24',
    },
  },
  lunas: {
    bg:   '#dcfce7',  // green-100
    text: '#166534',  // green-800
    dot:  '#22c55e',  // green-500
    dark: {
      bg:   '#052e16',
      text: '#bbf7d0',
      dot:  '#4ade80',
    },
  },
  bonus: {
    bg:   '#f3e8ff',  // purple-100
    text: '#6b21a8',  // purple-800
    dot:  '#a855f7',  // purple-500
    dark: {
      bg:   '#3b0764',
      text: '#e9d5ff',
      dot:  '#c084fc',
    },
  },
  danger: {
    DEFAULT: '#ef4444', // red-500: delete, destructive actions
    text: '#dc2626',
    darkText: '#f87171',
  },
  neutral: {
    50:  '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  }
}
```

### 2.2 Typography

- Font: `Inter` via local font files or `@fontsource/inter`; avoid runtime Google Fonts fetches unless explicitly allowed.
- Fallback stack: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Base body: `text-sm leading-6 text-neutral-900 dark:text-neutral-100`.
- Page title: `text-xl font-semibold leading-7 text-neutral-900 dark:text-neutral-50`.
- Section title: `text-base font-semibold leading-6 text-neutral-900 dark:text-neutral-100`.
- Card metric: `text-2xl font-bold leading-8 tabular-nums text-neutral-900 dark:text-neutral-50`.
- Table header: `text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400`.
- Table body: `text-sm leading-5 text-neutral-700 dark:text-neutral-200`.
- Form label: `text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400`.
- Helper text: `text-xs leading-5 text-neutral-500 dark:text-neutral-400`.
- Error text: `text-xs leading-5 text-danger-text dark:text-danger-darkText`.
- Number-heavy tables: use `font-mono tabular-nums` for all Rp amounts.
- Do not scale font size with viewport width. Use responsive layout changes instead.

### 2.3 Spacing Rhythm

Tailwind base unit = 4px. The app uses multiples of 4. Common values: `p-3` (12px) for compact table cells, `p-4` (16px) for card padding, `gap-3` (12px) for form field spacing.

### 2.4 Dark Mode

Use class-based dark mode (`darkMode: 'class'`) so the app can follow a user preference toggle later without changing component APIs.

Core surfaces:

- App background: `bg-neutral-50 dark:bg-neutral-950`
- Sidebar: `bg-white border-neutral-200 dark:bg-neutral-950 dark:border-neutral-800`
- Main surface/card: `bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800`
- Muted surface: `bg-neutral-50 dark:bg-neutral-800`
- Primary text: `text-neutral-900 dark:text-neutral-50`
- Secondary text: `text-neutral-500 dark:text-neutral-400`
- Default border: `border-neutral-200 dark:border-neutral-800`
- Row hover: `hover:bg-brand-50 dark:hover:bg-neutral-800`
- Focus ring: `focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 dark:focus:ring-offset-neutral-950`

Status colors must remain readable in dark mode. Use darker backgrounds and lighter text:

- Piutang: `bg-piutang-bg text-piutang-text dark:bg-piutang-dark-bg dark:text-piutang-dark-text`
- Lunas: `bg-lunas-bg text-lunas-text dark:bg-lunas-dark-bg dark:text-lunas-dark-text`
- Bonus: `bg-bonus-bg text-bonus-text dark:bg-bonus-dark-bg dark:text-bonus-dark-text`
- Danger/error text: `text-danger-text dark:text-danger-darkText`

### 2.5 Icon System

`@nuxt/icon` is installed in `package.json` and enabled in `nuxt.config.ts` through `modules: ['@nuxt/icon']`. All UI icons use Nuxt Icon:

```vue
<Icon name="lucide:plus" class="size-4" aria-hidden="true" />
```

Rules:

- No emoji in UI examples or production UI.
- No raw symbol icons such as check marks, cross marks, arrows, triangles, or gift emoji in buttons/badges.
- Use text labels plus Nuxt Icon for primary actions.
- Use icon-only buttons only for compact repeated actions, with an accessible label (`aria-label`) and a tooltip.
- Preferred icon set: `lucide:*`.
- Standard names: `lucide:plus`, `lucide:x`, `lucide:check`, `lucide:chevron-down`, `lucide:arrow-up`, `lucide:arrow-down`, `lucide:arrow-left`, `lucide:arrow-right`, `lucide:gift`, `lucide:eye`, `lucide:pencil`, `lucide:trash-2`, `lucide:download`, `lucide:menu`, `lucide:loader-circle`, `lucide:inbox`.

---

## 3. Layout

### 3.1 Shell

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px fixed)  │  Main Content Area         │
│                         │  (flex-1, max-w-7xl)       │
│  [HL logo]              │                            │
│  ─────────────          │  [Page header]             │
│  Dashboard              │  [Content]                 │
│  Pelanggan              │                            │
│  Produk                 │                            │
│  Transaksi              │                            │
│  Rekap                  │                            │
│  ─────────────          │                            │
│  [Logout]               │                            │
└─────────────────────────────────────────────────────┘
```

The sidebar is fixed. On screens < 768px it collapses to a hamburger menu with a slide-over drawer.

### 3.2 Page Header Pattern

Every page has a consistent header:

```
┌────────────────────────────────────────────────────┐
│ Page Title (text-xl font-semibold)   [Action btn]  │
│ Breadcrumb (text-sm text-neutral-500)              │
└────────────────────────────────────────────────────┘
```

Example: "Transaksi" with a "Buat Bon" button top-right. The button includes `<Icon name="lucide:plus" />`.

### 3.3 Card Pattern

Used for summary stats on Dashboard and Customer Detail:

```
┌─────────────────────────────┐
│ Label (text-xs uppercase)   │
│                             │
│ Rp 24.500.000 (text-2xl)    │
│ font-mono font-bold         │
└─────────────────────────────┘
```

---

## 4. Component Specifications

### 4.1 Status Badge

Used everywhere a Bon status appears.

```html
<!-- Piutang -->
<span
  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
             bg-piutang-bg text-piutang-text dark:bg-piutang-dark-bg dark:text-piutang-dark-text"
>
  <span class="w-1.5 h-1.5 rounded-full bg-piutang-dot"></span>
  Piutang
</span>

<!-- Lunas -->
<span
  class="... bg-lunas-bg text-lunas-text dark:bg-lunas-dark-bg dark:text-lunas-dark-text"
>
  <span class="... bg-lunas-dot"></span>
  Lunas
</span>

<!-- Bonus -->
<span
  class="... bg-bonus-bg text-bonus-text dark:bg-bonus-dark-bg dark:text-bonus-dark-text"
>
  <span class="... bg-bonus-dot"></span>
  Bonus
</span>
```

### 4.2 Currency Input

All Rp fields use a consistent input component:

```
┌──────────────────────────────┐
│ Rp │ 10.000.000               │
└──────────────────────────────┘
```

- Prefix "Rp" is a non-editable label inside the input wrapper
- Value is stored as integer (no decimals for IDR display; use numeric(15,2) in DB for precision)
- Display format: `.toLocaleString('id-ID')` with "Rp" prefix
- Negative values blocked

### 4.3 Discount Step Editor

Used in Customer form for both LM and BR:

```
LM Diskon
┌────────────────────────────────────────┐
│  Langkah 1: [  20  ] %   [up][down][remove] │
│  Langkah 2: [  20  ] %   [up][down][remove] │
│  Langkah 3: [  10  ] %   [up][down][remove] │
│  Tambah Langkah                            │
└────────────────────────────────────────┘
Harga efektif: 57.6% dari harga base
```

Step controls use Nuxt Icon buttons:

- Move up: `<Icon name="lucide:arrow-up" />`
- Move down: `<Icon name="lucide:arrow-down" />`
- Remove: `<Icon name="lucide:x" />`
- Add step: `<Icon name="lucide:plus" />`

The "Harga efektif" preview updates live as steps are edited. This is the single most trust-building feature in the discount setup, because the operator can verify the cascaded result immediately.

### 4.4 Product Line in Bon Form

```
┌──────────────────────────────────────────────────────────────┐
│ Produk: [Searchable dropdown]   Tipe: LM                     │
│ Harga Base: Rp 100.000  Diskon: 20-20-10  Rp 57.600         │
│ Qty: [ 5 ]   Omzet: Rp 288.000                    [Hapus]   │
└──────────────────────────────────────────────────────────────┘
```

The product dropdown uses `<Icon name="lucide:chevron-down" />`. The read-only discount result uses label/value spacing instead of an arrow glyph. The remove action uses `<Icon name="lucide:x" />` plus "Hapus".

The grey secondary line (Harga Base, Diskon chain, discounted price) is read-only. It lets the operator see exactly what discount is being applied without needing to open a separate screen.

Add line button at the bottom: "Tambah Produk" with `<Icon name="lucide:plus" />`.

### 4.5 Transaction Summary Bar

Fixed at the bottom of the Bon creation form:

```
┌────────────────────────────────────────────────────────┐
│ Omzet: Rp 576.000  Ongkir: Rp 25.000                  │
│ Total Tagihan: Rp 601.000              [Simpan Bon]    │
└────────────────────────────────────────────────────────┘
```

### 4.6 Settlement Modal

```
┌─────────────────────────────────────────┐
│ Konfirmasi Pelunasan            [close] │
│                                         │
│ Tanggal Lunas                           │
│ ┌─────────────────────────────────┐     │
│ │ [Date Picker - DD/MM/YYYY     ] │     │
│ └─────────────────────────────────┘     │
│                                         │
│ [Batal]              [Tandai Lunas]    │
└─────────────────────────────────────────┘
```

The close action uses `<Icon name="lucide:x" />`. The confirm action uses `<Icon name="lucide:check" />` before "Tandai Lunas".

For settle-month modal, also shows: "Jumlah bon yang akan dilunasi: 7"

### 4.7 Data Tables

Standard table used throughout lists:

- Zebra rows: alternating `bg-white dark:bg-neutral-900` / `bg-neutral-50 dark:bg-neutral-950`
- Row hover: `hover:bg-brand-50 dark:hover:bg-neutral-800`
- Sticky header on scroll
- Rp columns: right-aligned, `font-mono tabular-nums`
- Date columns: DD/MM/YYYY format
- Actions column: right-aligned Nuxt Icon buttons (`lucide:eye`, `lucide:pencil`, `lucide:trash-2`)
- Empty state: centered "Belum ada data" with a faint `<Icon name="lucide:inbox" />`

Sorting is not required in v1 except for date (newest first by default).

### 4.8 Bonus Eligibility Badge

Shown on Customer list rows and Customer detail header:

```
┌───────────────────────┐
│  2 Bonus Tersedia     │
└───────────────────────┘
```

The badge uses `<Icon name="lucide:gift" />` before the label.

Clicking this on the customer detail page scrolls to or opens the "Buat Bon Bonus" flow.

---

## 5. Page Designs

### 5.1 Dashboard (`/`)

Four summary cards in a 2×2 grid (or 4-column on wide screens):

- Total Piutang Semua Pelanggan
- Total Omzet Bulan Ini (Lunas)
- Jumlah Pelanggan dengan Piutang Aktif
- Jumlah Pelanggan dengan Bonus Tersedia

Below: two compact tables side by side:

- "Piutang Terlama" (top 5 customers by oldest unpaid Bon)
- "Bonus Belum Diambil" (customers with bonuses_available >= 1)

Button: "Buat Bon Baru" with `<Icon name="lucide:plus" />` in the page header.

### 5.2 Customer List (`/customers`)

Search bar + "Tampilkan Diarsipkan" toggle.

Table columns: Nama | Bon Aktif | Total Piutang | Bonus | Aksi

The "Bonus" column shows the purple badge if eligibility exists, otherwise empty.

"Aksi" column: View detail, Edit, Delete. Use `lucide:eye`, `lucide:pencil`, and `lucide:trash-2`.

### 5.3 Customer Detail (`/customers/[id]`)

**Header section:**

- Customer name (large), bonus badge if applicable
- Two buttons: "Edit Pelanggan" and "Buat Bon Baru"

**Discount preview:**

- Two small tables side by side: LM discount chain + effective price preview, BR discount chain + effective price preview

**Month selector:**

- Month/year tabs or a dropdown. Default: current month.

**Monthly summary cards (4 cards):**

- Total Piutang | Total Sudah Dibayar
- Total Omzet (LM + BR split) | Total Laba HL

**"Sudah Lunas" button** on month header (appears only if there are Piutang Bon in that month)

**Transaction table** (see 4.7 spec above) with status badges

**PDF buttons:** "Download Daftar Piutang" and "Download Semua Transaksi"

### 5.4 Bon Form (`/transactions/new`, `/transactions/[id]/edit`)

Left column (60%): Product lines section
Right column (40%): Bon header (Nomor, Tanggal, Pelanggan, Ongkir, Deskripsi, Status, Bonus toggle)

On mobile: stacked, header first then product lines.

The summary bar is sticky at the bottom.

### 5.5 Bon Detail (`/transactions/[id]`)

Read-only view of all Bon data. Shows:

- Header info in two-column layout
- Product lines table with discounted price, qty, omzet, and laba per line
- Summary: Omzet, Ongkir, Total Tagihan, Laba HL total (internal only)
- Status badge + Tanggal Lunas (if settled)
- Action buttons: Edit | Delete | Lunas (if Piutang)

### 5.6 Recap Pages (`/recap/*`)

Consistent layout across all three recap types:

- Filter bar: Year picker + Month picker (optional, "All months" for annual view)
- Summary cards: Total Omzet | Total Laba | Total Piutang | Total Sudah Dibayar
- Main table: month-by-month breakdown (rows = months, columns = metrics)
- LM / BR split table below the main table
- Bonus log table at the bottom (Bon bonus with date and products, excluded from main totals)
- "Download PDF" button top-right

---

## 6. Navigation & Routing

### 6.1 Sidebar Navigation Items (Indonesian labels)

```
Dashboard
Pelanggan
Produk
Transaksi
Rekap
  └─ Per Pelanggan
  └─ Per Tipe (LM/BR)
  └─ Keseluruhan
```

Active state: `bg-brand-100 text-brand-700 font-semibold` left border `border-l-2 border-brand-500`

### 6.2 Breadcrumbs

Shown on all pages except Dashboard:

```
Pelanggan > Budi Santoso > Januari 2026
```

### 6.3 Back Navigation

Form pages (New / Edit) always show a "Kembali" link above the page title with `<Icon name="lucide:arrow-left" />`.

---

## 7. Forms & Validation

### 7.1 Validation Timing

- Required fields: validate on blur (not on keystroke)
- Nomor Bon uniqueness: validate on blur via API call
- Discount steps: validate on blur
- Numeric fields: validate on blur, also block non-numeric input

### 7.2 Error Display

Field-level errors appear below the input in `text-xs text-danger-text dark:text-danger-darkText`. The field border changes to `border-danger dark:border-danger-darkText`.

Form-level errors (e.g., "Bon gagal disimpan") appear as a red alert banner at the top of the form.

### 7.3 Loading States

- Save button shows `<Icon name="lucide:loader-circle" class="animate-spin" />` plus "Menyimpan..." while in flight
- Dropdowns show a skeleton loader while fetching
- Settlement confirmation button shows `<Icon name="lucide:loader-circle" class="animate-spin" />` plus "Memproses..."

### 7.4 Success Feedback

Toast notification (bottom-right, 3 second auto-dismiss):

- Green: "Bon berhasil disimpan"
- Green: "Pelunasan berhasil"
- Red: Errors that aren't field-specific

---

## 8. Mobile Adaptations (min 375px)

- Sidebar collapses to hamburger + slide-over drawer
- Bon form stacks vertically (header section above product lines)
- Summary cards collapse to 2-column grid instead of 4
- Data tables become horizontally scrollable with frozen first column (Nomor Bon or Nama)
- Settlement modal takes full screen on mobile
- PDF download opens in a new tab (browser handles the download prompt)

---

## 9. Backend Architecture (Supabase)

### 9.1 Auth

- Supabase Auth, email/password
- Single user pre-seeded
- All tables have RLS enabled with policy: `auth.uid() = owner_uid` (where `owner_uid` is a hardcoded constant or environment variable for the single user)

### 9.2 Real-time

Not required for v1. All updates use standard request-response.

### 9.3 Storage

No file storage needed. PDFs are generated client-side and downloaded directly.

### 9.4 Supabase Functions (Edge Functions)

Optional for v1. The only candidate is the settlement batch endpoint (settle all Bon in a month atomically), which can be handled with a Supabase database function (PL/pgSQL) called via `.rpc()`:

```sql
CREATE OR REPLACE FUNCTION settle_month(
  p_customer_id uuid,
  p_year int,
  p_month int,
  p_tanggal_lunas date
)
RETURNS void AS $$
BEGIN
  UPDATE transactions
  SET status = 'lunas', tanggal_lunas = p_tanggal_lunas
  WHERE customer_id = p_customer_id
    AND EXTRACT(YEAR FROM tanggal) = p_year
    AND EXTRACT(MONTH FROM tanggal) = p_month
    AND status = 'piutang'
    AND is_bonus = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 9.5 Computed Values Strategy

Store computed values (`discounted_price`, `line_omzet`, `line_laba_hl`) on `transaction_lines` at write time. Do not compute on read. This makes reports fast and ensures historical data never changes when Harga Modal or discount steps are edited later.

Recalculate and store fresh values only when a transaction is explicitly edited.

---

## 10. Nuxt 3 Architecture

### 10.1 Directory Structure

```
├── assets/
│   └── css/main.css
├── components/
│   ├── ui/
│   │   ├── CurrencyInput.vue
│   │   ├── StatusBadge.vue
│   │   ├── DataTable.vue
│   │   ├── ConfirmModal.vue
│   │   └── ToastNotification.vue
│   ├── customer/
│   │   ├── DiscountStepEditor.vue
│   │   └── BonusEligibilityBadge.vue
│   ├── transaction/
│   │   ├── ProductLineEditor.vue
│   │   └── TransactionSummaryBar.vue
│   └── recap/
│       └── RecapFilterBar.vue
├── composables/
│   ├── useDiscount.ts        # cascading discount calculation
│   ├── useBonusCalc.ts       # bonus accumulator logic
│   ├── useReportCalc.ts      # report aggregation helpers
│   └── usePdfExport.ts       # PDF generation
├── pages/
│   ├── index.vue             # Dashboard
│   ├── login.vue
│   ├── customers/
│   │   ├── index.vue
│   │   ├── new.vue
│   │   └── [id]/
│   │       ├── index.vue
│   │       └── edit.vue
│   ├── products/
│   │   ├── index.vue
│   │   ├── new.vue
│   │   └── [id]/edit.vue
│   ├── transactions/
│   │   ├── index.vue
│   │   ├── new.vue
│   │   └── [id]/
│   │       ├── index.vue
│   │       └── edit.vue
│   └── recap/
│       ├── customer/[id].vue
│       ├── type/[tipe].vue
│       └── overall.vue
├── server/
│   └── (minimal, most logic via Supabase client)
├── utils/
│   ├── currency.ts           # IDR formatting helpers
│   └── date.ts               # date formatting (DD/MM/YYYY, id-ID locale)
└── middleware/
    └── auth.global.ts        # redirect to /login if no session
```

### 10.2 Key Composables

**`useDiscount.ts`**

```ts
export function calcDiscountedPrice(
  basePrice: number,
  steps: number[],
): number {
  return steps.reduce((price, step) => price * (1 - step / 100), basePrice);
}

export function discountChainLabel(steps: number[]): string {
  return steps.join("-"); // e.g., "20-20-10"
}
```

**`useBonusCalc.ts`**

```ts
export function calcBonusesAvailable(
  accumulatedOmzet: number,
  threshold: number,
  alreadyGranted: number,
): number {
  if (threshold <= 0) return 0;
  return Math.floor(accumulatedOmzet / threshold) - alreadyGranted;
}
```

**`currency.ts`**

```ts
export function formatRp(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
```

### 10.3 Middleware

`auth.global.ts` runs on every navigation. If no Supabase session, redirect to `/login`. The `/login` route is excluded from this check.

---

## 11. PDF Export Design

PDF files use a consistent layout:

**Header:**

```
HL - [Report Title]
[Date range or Month/Year]
Dicetak: [Date]
```

**Body:** Tailwind-styled HTML table rendered via `html2pdf.js` or `@nuxtjs/pdf`.

**Footer:** Page number (e.g., "1 / 3")

Harga Modal and Laba HL are excluded from customer-facing PDFs (transaction list for a customer). They only appear in internal recap PDFs.

---

## 12. Accessibility & Keyboard Navigation

- All interactive elements are keyboard-focusable
- Focus ring: `focus:ring-2 focus:ring-brand-500 focus:ring-offset-1`
- Modal traps focus while open
- Discount step reorder uses Up/Down keyboard on the step inputs as an alternative to drag
- Date pickers fall back to `<input type="date">` on mobile (native picker)
