# Software Requirements Specification
## HL Sales & Receivables Management App

**Version:** 1.0  
**Date:** June 2026  
**Stack:** Nuxt 3 · Tailwind CSS · Supabase  
**Currency:** IDR (Rp) only. No tax / PPN.  
**App Language:** Bahasa Indonesia  
**Doc Language:** English

---

## 1. Introduction

### 1.1 Purpose

This document defines the functional and non-functional requirements for the HL Sales & Receivables Management App, a single-user internal tool for managing customers, products, sales transactions (Bon), receivables (Piutang), bonus programs, and monthly reporting.

### 1.2 Scope

The app covers the complete order-to-cash cycle for business "HL": creating and tracking Bon, managing cascading discounts per customer per product type, settling Piutang, awarding bonuses, and generating PDF reports. No multi-user, no multi-currency, no tax/PPN.

### 1.3 Definitions

| Term | Meaning |
|---|---|
| Bon | A single sales transaction / invoice, identified by Nomor Bon |
| LM / BR | Two product types. Each customer has a separate discount set per type |
| Harga Modal | Product cost (what HL pays). Used only for profit calculation |
| Harga Base / Harga Jual | Product list price before discount |
| Diskon bertingkat | Cascading discounts: applied sequentially, not summed |
| Ongkir | Shipping cost. Pass-through; charged to customer, no profit impact |
| Omzet | Revenue = discounted price × qty (ongkir excluded). Recognized only when Lunas |
| Laba HL | Profit = (discounted price - modal) × qty. Recognized only when Lunas |
| Piutang | Receivable / unpaid balance |
| Lunas | Fully paid / settled |
| jt | Shorthand for juta = 1,000,000 IDR |

### 1.4 Accounting Basis

Cash basis throughout. Omzet, Laba HL, and bonus accumulation count only on Lunas transactions (Decision D3).

---

## 2. Overall Description

### 2.1 Product Perspective

A standalone web app (Nuxt 3 SPA/SSR) backed by Supabase (PostgreSQL + Auth + Storage). Single-user: one login, no registration flow, no multi-tenant concerns.

### 2.2 User Classes

One class only: the HL business owner. Full access to all features.

### 2.3 Operating Environment

- Browser: Chrome/Firefox/Safari (desktop-first, mobile-accessible)
- Backend: Supabase (hosted)
- PDF export: client-side or server-side generation (see Section 7)

### 2.4 Constraints

- IDR currency only
- No PPN / tax calculations
- Soft-delete for all master data (customers, products) that have transaction history
- Nomor Bon must be globally unique

---

## 3. Functional Requirements

### 3.1 Authentication (AC-1.x)

**FR-1.1** The app blocks all routes until login. Unauthenticated requests redirect to `/login`.

**FR-1.2** Exactly one user account. No self-registration endpoint exists. The account is seeded manually in Supabase Auth.

**FR-1.3** Successful login lands the user on `/dashboard`.

**FR-1.4** Failed login shows an inline error message. No access is granted.

**FR-1.5** Session persists via Supabase session tokens. A "Logout" action is available from any page via the sidebar or header menu.

### 3.2 Customer Management (AC-2.x)

**FR-2.1** Create customer: required field is Nama. Optional at creation: discount sets, bonus threshold.

**FR-2.2** Edit any customer field after creation.

**FR-2.3** Delete performs soft-delete (sets `deleted_at`). Soft-deleted customers are hidden from dropdowns and new-transaction customer pickers but remain in all historical data and reports.

**FR-2.4** Each customer holds two independent discount sets: one for LM, one for BR.

**FR-2.5** A discount set is an ordered list of percentage values (e.g., `[20, 20, 10]`). Order matters: discounts apply sequentially, not summed.

**FR-2.6** Within a discount set the user can add, reorder, edit, and delete individual steps.

**FR-2.7** Discount step values must be numeric, between 0 and 100 (inclusive). Invalid entries are rejected with field-level validation messages.

**FR-2.8** Each customer has a bonus eligibility threshold (Rupiah integer, e.g., `10000000`). Default = 0 (no bonus program).

**FR-2.9** Cascading discount formula (enforced everywhere):

```
discounted_unit_price = base_price × ∏(1 − dᵢ/100)
```

Example: base = 100, steps = [20, 20, 10] → 100 × 0.8 × 0.8 × 0.9 = **57.6** (not 50).

### 3.3 Product Management (AC-3.x)

**FR-3.1** Create, edit, and delete products.

**FR-3.2** Product Tipe is restricted to `LM` or `BR`.

**FR-3.3** Harga Modal and Harga Base are numeric, must be >= 0.

**FR-3.4** Harga Modal is not shown to any customer-facing view. It appears only in Laba HL calculations.

**FR-3.5** Delete performs soft-delete. Deleted products are hidden from product pickers but preserved in transaction history.

### 3.4 Transaction (Bon) Management (AC-4.x)

**FR-4.1** Tanggal defaults to current date. User can change it.

**FR-4.2** Nomor Bon is required and must be unique across all transactions. Saving a duplicate Nomor Bon is rejected with a clear error.

**FR-4.3** Customer is selected from active (non-deleted) customers via dropdown. Free-text entry is not allowed.

**FR-4.4** Products are selected from the active product catalog. Free-text entry is not allowed.

**FR-4.5** A transaction supports multiple product lines, each with its own quantity (min = 1).

**FR-4.6** Each product line displays: product name, Tipe (LM/BR), discounted unit price (auto-computed from the selected customer's discount set for that product type), and line omzet.

**FR-4.7** Discounts are derived automatically from customer × product type. The user does not manually enter discounts on the transaction form.

**FR-4.8** Ongkir is a single numeric field per transaction (>= 0).

**FR-4.9** Status defaults to `Piutang` on creation.

**FR-4.10** User can view, edit, and delete any transaction. Editing triggers recalculation of all computed fields (omzet, profit, totals).

**FR-4.11** Computed values shown on transaction:
- Per-line omzet = discounted unit price × qty
- Transaction omzet = sum of line omzets (ongkir excluded)
- Amount owed (Piutang) = transaction omzet + ongkir
- Per-line Laba HL = (discounted unit price - harga modal) × qty (shown internally, not customer-facing)

### 3.5 Bonus Logic (AC-5.x)

**FR-5.1** Bonus eligibility is per-customer, based on that customer's threshold.

**FR-5.2** The system maintains a running `bonus_accumulator` per customer = sum of omzet from all Lunas transactions (excluding bonus transactions themselves).

**FR-5.3** Bonuses earned = `floor(bonus_accumulator / threshold) - bonuses_already_granted`.

**FR-5.4** When `bonuses_earned >= 1`, the customer detail page and customer list show an eligibility badge with the count available.

**FR-5.5** A bonus is recorded as a Bon with `is_bonus = true`. The user can assign multiple bonus units in one Bon.

**FR-5.6** Each bonus granted consumes exactly one threshold unit from the accumulator. Remainder carries over.

**FR-5.7** Bonus product lines have no omzet and no Laba impact. Their `harga modal` cost is ignored.

**FR-5.8** Bonus transactions are visually distinct in all lists (badge or color tag "BONUS"). They are excluded from revenue, omzet, and profit totals in all reports.

**FR-5.9** Worked example validation:
- Customer A threshold = Rp 10,000,000
- Accumulated paid omzet = Rp 25,000,000
- Bonuses already granted = 0
- Result: 2 bonuses available
- After granting both in one Bon: accumulator remainder = Rp 5,000,000

### 3.6 Customer Detail Page (AC-6.x)

**FR-6.1** Each customer has a dedicated page at `/customers/[id]`.

**FR-6.2** Transactions are grouped by month/year. A month/year selector controls the visible period.

**FR-6.3** Per selected month the page shows:
- List of Bon (date, Nomor Bon, status, amount owed)
- Total Piutang (sum of omzet + ongkir for Piutang transactions)
- Total Sudah Dibayar (sum of omzet + ongkir for Lunas transactions)
- Total Omzet (Lunas only, ongkir excluded)
- Total Laba HL (Lunas only)

**FR-6.4** Omzet is split into LM column and BR column, plus combined total.

**FR-6.5** PDF download available for the Piutang list and full transaction list.

**FR-6.6** "Settle Month" flow: user clicks "Sudah Lunas" on a month view. A modal asks for Tanggal Pelunasan. On confirm, every Piutang transaction in that month for that customer is set to Lunas with the entered date.

**FR-6.7** "Settle Single Bon" flow: from the Bon detail, user clicks "Lunas". Same payment-date modal. Only that Bon is settled.

**FR-6.8** Settlement recalculates totals immediately on the page (no full reload required). Piutang total decreases; Sudah Dibayar, recognized Omzet, recognized Laba, and bonus accumulator all increase.

**FR-6.9** Already-Lunas transactions cannot be re-settled. They appear with a distinct visual style (e.g., muted row + "Lunas" badge).

**FR-6.10** Clicking a Bon row opens its full detail view showing all lines, quantities, prices, ongkir, omzet, status, and payment date (if settled).

### 3.7 Recap / Reporting (AC-7.x)

**FR-7.1** Recap per customer.

**FR-7.2** Recap per product type (LM / BR).

**FR-7.3** Recap overall (all customers).

**FR-7.4** All recaps support month filter and year filter, independently.

**FR-7.5** Each recap shows at minimum:
- Total Omzet (Lunas)
- Total Laba HL (Lunas)
- Total Piutang (outstanding, not yet Lunas)
- Total Sudah Dibayar
- LM vs BR breakdown where relevant

**FR-7.6** Overall recap shows aggregate Laba HL across all customers.

**FR-7.7** Bonus transactions are excluded from revenue totals. A separate bonus log section shows bonus Bon granted.

**FR-7.8** All recap views are downloadable as PDF.

---

## 4. Master Calculation Reference

This table is the single source of truth. All implementations must match exactly.

| Quantity | Formula |
|---|---|
| Discounted unit price | `base × ∏(1 − dᵢ/100)` over customer's discount steps for that product type |
| Line omzet | `discounted_unit_price × qty` |
| Transaction omzet | `Σ line_omzet` (ongkir excluded) |
| Amount owed (Piutang) | `transaction_omzet + ongkir` |
| Line Laba HL | `(discounted_unit_price − harga_modal) × qty` |
| Transaction Laba HL | `Σ line_laba_hl` (ongkir excluded, ongkir is pass-through) |
| Recognized Omzet (reports) | `Σ transaction_omzet WHERE status = 'lunas'` |
| Recognized Laba HL (reports) | `Σ transaction_laba_hl WHERE status = 'lunas'` |
| Total Sudah Dibayar | `Σ (transaction_omzet + ongkir) WHERE status = 'lunas'` |
| Total Outstanding Piutang | `Σ (transaction_omzet + ongkir) WHERE status = 'piutang'` |
| Bonus accumulator | `Σ transaction_omzet WHERE status = 'lunas' AND is_bonus = false` (per customer) |
| Bonuses available | `floor(bonus_accumulator / threshold) − bonuses_already_granted` |
| Bonus items | 0 omzet, 0 profit impact |

---

## 5. Non-Functional Requirements

### 5.1 Performance

- Page load (initial): < 2 seconds on a standard broadband connection
- Transaction list (up to 500 records): renders in < 500ms
- PDF generation: completes within 3 seconds for up to 100 line items

### 5.2 Usability

- All primary actions reachable within 2 clicks from the sidebar
- Mobile-accessible (min viewport 375px) even if desktop is primary
- Form validation shows inline errors, not just toast notifications
- Confirmation modals for all destructive actions (delete, settle)

### 5.3 Reliability

- Supabase Row Level Security (RLS) enforces single-user data isolation
- All writes use database transactions where multiple rows are updated (e.g., settling a whole month)
- No orphaned data: soft-delete instead of hard-delete for all entities with foreign key history

### 5.4 Security

- Auth via Supabase Auth (email + password)
- All API calls use the authenticated Supabase client (JWT token)
- Harga Modal (cost price) is never exposed in any customer-facing PDF or UI label

### 5.5 Maintainability

- All calculation logic isolated in composables (`useDiscount`, `useBonusCalc`, `useReportCalc`)
- Supabase schema uses views for pre-aggregated report queries
- PDF generation abstracted behind a single `usePdfExport` composable

---

## 6. Data Model (Logical)

### 6.1 Tables

```
customers
  id                uuid PK
  nama              text NOT NULL
  bonus_threshold   integer DEFAULT 0
  bonuses_granted   integer DEFAULT 0
  deleted_at        timestamptz NULL

discount_steps
  id                uuid PK
  customer_id       uuid FK → customers.id
  product_type      text CHECK IN ('LM', 'BR')
  step_order        integer NOT NULL
  percentage        numeric(5,2) NOT NULL

products
  id                uuid PK
  nama              text NOT NULL
  harga_modal       numeric(15,2) NOT NULL
  harga_base        numeric(15,2) NOT NULL
  tipe              text CHECK IN ('LM', 'BR')
  deleted_at        timestamptz NULL

transactions (bon)
  id                uuid PK
  nomor_bon         text UNIQUE NOT NULL
  tanggal           date NOT NULL
  customer_id       uuid FK → customers.id
  ongkir            numeric(15,2) DEFAULT 0
  deskripsi         text
  is_bonus          boolean DEFAULT false
  status            text CHECK IN ('piutang', 'lunas') DEFAULT 'piutang'
  tanggal_lunas     date NULL
  omzet             numeric(15,2) GENERATED or stored
  laba_hl           numeric(15,2) GENERATED or stored

transaction_lines
  id                uuid PK
  transaction_id    uuid FK → transactions.id
  product_id        uuid FK → products.id
  product_type      text CHECK IN ('LM', 'BR')  -- snapshot at time of creation
  harga_modal_snap  numeric(15,2)               -- snapshot
  harga_base_snap   numeric(15,2)               -- snapshot
  discounted_price  numeric(15,2)               -- computed and stored
  qty               integer NOT NULL CHECK > 0
  line_omzet        numeric(15,2)               -- computed and stored
  line_laba_hl      numeric(15,2)               -- computed and stored
```

Price snapshots on `transaction_lines` prevent retroactive changes to Harga Modal or Harga Base from altering historical Bon values.

---

## 7. PDF Export

PDF generation uses client-side rendering via `@vueuse/core` + a library such as `jsPDF` or `html2pdf.js`, triggered from the composable `usePdfExport`. The export targets:
- Per-customer monthly Piutang list
- Per-customer monthly transaction list  
- Recap reports (per customer, per type, overall)

All PDFs are in Indonesian and include: business name "HL," date range, and page numbers.

---

## 8. Confirmed Decisions (carried from AC document)

| # | Decision |
|---|---|
| D1 | Ongkir is pass-through. Laba = omzet - modal (ongkir excluded from both). |
| D2 | Customer owes omzet + ongkir. Omzet itself excludes ongkir. |
| D3 | Only Lunas transactions count toward omzet, profit, and bonus accumulation (cash basis). |
| D4 | Bonuses stack. Multiple bonuses can go in one Bon. Each consumes one threshold; remainder carries. |
| D5 | Bonus product cost is ignored in profit. Free items don't reduce Laba HL. |
| D6 | Soft-delete everywhere for data with transaction history. |
| D7 | Nomor Bon must be globally unique. Duplicates are rejected. |
| D8 | Export format: PDF only. |
| D9 | IDR only. No tax/PPN. |
