# Product Requirements Document
## HL Sales & Receivables Management App

**Version:** 1.0  
**Date:** June 2026  
**Owner:** HL Business  
**Stack:** Nuxt 3 · Tailwind CSS · Supabase

---

## 1. Product Overview

### 1.1 The Problem

HL currently tracks sales transactions, customer receivables, cascading discounts, and bonus eligibility in spreadsheets or manually. This creates errors in discount calculation (especially the cascading multi-step type), makes it hard to know who owes what at a glance, and requires manual bonus tracking.

### 1.2 What We're Building

A private web app for a single HL operator. It handles the full cycle: enter a Bon, auto-apply the right cascading discount for that customer+product type, track who's paid (Lunas) and who hasn't (Piutang), award bonuses when thresholds are hit, and pull monthly reports in PDF.

The UI is in Bahasa Indonesia. All numbers are IDR. No tax.

### 1.3 Success Criteria

- Zero manual discount calculations. The app computes them.
- The operator can see total outstanding Piutang per customer within 2 clicks of opening the app.
- Settling a whole month takes one action (one button, one date entry, confirm).
- Monthly PDF reports are ready in under 3 seconds.
- Bonus eligibility surfaces automatically without the operator needing to check.

---

## 2. User Persona

**Single user: the HL business owner/operator.**

Day-to-day tasks:
- Creates 5-20 Bon per week
- Needs to know which customers haven't paid and for how long
- Manually tracked bonus eligibility before this app
- Not a developer; expects the UI to be self-explanatory
- Works primarily on desktop, sometimes on mobile when at a customer's location

Pain points now:
- Miscalculating cascading discounts (the 20-20-10 pattern especially)
- Losing track of which months have been fully settled
- Manual bonus tracking gets out of sync

---

## 3. Feature Scope

### 3.1 In Scope (v1.0)

- Login / session management (single user)
- Customer CRUD with per-customer cascading discount sets (LM + BR separately)
- Product CRUD (LM / BR types, Harga Modal, Harga Base)
- Transaction (Bon) creation, editing, deletion with:
  - Auto-applied cascading discounts
  - Multiple product lines
  - Ongkir (pass-through)
  - Piutang / Lunas status
  - Bonus flag
- Settlement flows: settle single Bon, settle entire month
- Bonus program: accumulator, threshold, eligibility badge, bonus Bon creation
- Customer detail page with monthly grouping
- Recap reports: per customer, per product type, overall
- PDF export for transaction lists and recaps
- Soft-delete for customers and products

### 3.2 Out of Scope (v1.0)

- Multiple user accounts
- Multi-currency
- PPN / tax
- WhatsApp or email invoice sending
- Inventory tracking
- Purchase orders

---

## 4. Feature Details

### 4.1 Authentication

One login screen. Email + password via Supabase Auth. No "forgot password" flow required at v1 (the operator can reset via Supabase dashboard). Session persists until explicit logout.

**Acceptance:** Login with valid credentials lands on Dashboard. Invalid credentials show "Email atau password salah." No access to any route without a valid session.

### 4.2 Dashboard

The first screen after login. Shows at a glance:

- Total Piutang outstanding (all customers, all time)
- Total Omzet this month (Lunas)
- Customers with overdue Piutang (Bon older than 30 days, still Piutang)
- Customers with unclaimed bonuses (bonus badge count)
- Quick-add button for new Bon

The dashboard doesn't need to be a heavy analytics page. It's a status summary. Four or five numbers, a short list.

### 4.3 Customer Management

**List view:** Table with Nama, active Bon count, total Piutang, bonus eligibility indicator. Search by name. Link to customer detail page.

**Create / Edit form:**
- Nama (required)
- Bonus threshold (Rp, optional, default 0)
- Discount set for LM: ordered list of percentage inputs. Add/remove/reorder steps.
- Discount set for BR: same.

Discount step validation: numeric, 0-100. Saving with invalid steps blocks submission and shows inline errors.

**Delete:** Soft-delete confirmation modal ("Yakin hapus customer ini? Riwayat transaksi tetap tersimpan."). After soft-delete, the customer row shows greyed out with a "Diarsipkan" label or disappears from active list depending on filter state.

### 4.4 Product Management

**List view:** Table with Nama, Tipe, Harga Base. Harga Modal is not shown in this list (internal only). Search by name, filter by Tipe.

**Create / Edit form:** Nama, Tipe (LM/BR dropdown), Harga Modal, Harga Base. All numeric fields validated >= 0.

**Delete:** Soft-delete. Products with existing transaction lines cannot be hard-deleted.

### 4.5 Transaction (Bon) Creation

The most-used screen in the app. It needs to be fast and clear.

**Form layout:**
1. Header section: Nomor Bon, Tanggal (date picker, defaults today), Customer (searchable dropdown), Deskripsi, Ongkir, Bonus toggle, Status
2. Product lines section: Add product lines dynamically. Each line: product picker (searchable), quantity input. Auto-display shows: Tipe, effective discount (e.g., "20-20-10"), discounted unit price, line omzet.
3. Summary section: Transaction omzet, Ongkir, Total Tagihan (omzet + ongkir).

Discount calculation happens live as the user selects customer and product. No "calculate" button.

If the customer has `is_bonus = true` toggle on, a note appears: "Bon ini adalah bon bonus. Produk tidak dikenakan harga."

**Nomor Bon uniqueness:** Checked on blur (API call) and also on save. Show "Nomor bon sudah dipakai" inline if duplicate.

### 4.6 Transaction Detail & Edit

Shows all data from the Bon including per-line prices and omzet. Edit opens the same form pre-filled. Delete shows confirmation modal.

The "Lunas" button appears only on Piutang transactions. Clicking it opens the payment date modal.

Laba HL per line is shown here for the operator (internal view), but not in any customer-facing PDF.

### 4.7 Settlement Flows

**Settle single Bon:** "Lunas" button on Bon detail. Modal: "Tanggal Pelunasan" date picker (defaults today). Confirm button. On confirm: status → lunas, tanggal_lunas saved, omzet and laba added to recognized totals, bonus_accumulator updated, page totals refresh.

**Settle whole month:** On the customer detail page, each month header has a "Sudah Lunas" button. Same modal. On confirm: all Piutang Bon in that month for that customer are settled in a single database transaction.

Both flows are atomic. If any Bon in the batch fails to update, the whole operation rolls back.

### 4.8 Customer Detail Page

URL: `/customers/[id]`

Month/year selector at the top (defaults to current month). The page re-fetches on selector change.

Monthly summary cards: Total Piutang, Total Sudah Dibayar, Total Omzet (LM | BR | Combined), Total Laba HL.

Transaction table: Date | Nomor Bon | Status badge | Amount Owed | Action (view/settle).

Bonus status bar: "Bonus tersedia: 2" with a "Buat Bon Bonus" shortcut.

PDF download buttons for Piutang list and full transaction list.

### 4.9 Bonus Program

Bonus eligibility shows whenever `bonuses_available >= 1`. The badge appears on:
- Customer list row
- Customer detail page header
- Dashboard "Customers with unclaimed bonuses" section

Creating a bonus Bon: user clicks "Buat Bon Bonus" (or toggles `is_bonus` on a new Bon). The form makes all product lines free (harga 0, omzet 0). The number of bonus units being used is entered (default 1). The system deducts `units_used × threshold` from the bonus_accumulator and adds `units_used` to `bonuses_granted`.

### 4.10 Recap / Reporting

**Per-customer recap:** `/recap/customer/[id]`. Filter: year, month. Shows Total Omzet (Lunas), Total Laba HL, Total Piutang, Total Sudah Dibayar, LM/BR split. Bonus Bon listed separately below the main table.

**Per-type recap:** `/recap/type/[lm|br]`. Same filters. Aggregated across all customers.

**Overall recap:** `/recap/overall`. Same filters. Total Laba HL across all customers.

All three pages have a "Download PDF" button. PDFs render the same data with HL branding (business name, date range, page numbers).

---

## 5. UX Principles

### 5.1 Fast Entry

The Bon creation form is the most-used screen. Every optimization goes here first. Searchable dropdowns. Tab-order that makes sense. Live calculation so the operator sees totals as they type. Keyboard shortcuts for "Add product line" (e.g., Enter at end of last line).

### 5.2 Clarity Over Density

Show the numbers that matter. Don't bury Piutang total under three levels of navigation. The customer detail page is built around the question "how much does this customer owe me right now?" Answer that on first load.

### 5.3 Confirmation for Destructive / Irreversible Actions

Delete anything: modal confirmation. Settle a month: modal with date entry. The user should never accidentally settle 10 Bon because they clicked the wrong button.

### 5.4 Inline Feedback

Validation errors appear next to the offending field, not as a toast after failed submission. Duplicate Nomor Bon shows an error immediately on blur. Successful saves show a brief toast ("Bon disimpan"). Settlement shows a success state immediately (status badge changes, totals update).

### 5.5 Graceful Soft-Delete

Archived customers and products should not pollute the active working views. But historical data must never disappear. The system communicates this clearly: "Customer diarsipkan. Riwayat transaksi tetap ada."

---

## 6. Page Map

```
/login
/dashboard
/customers
  /customers/new
  /customers/[id]
  /customers/[id]/edit
/products
  /products/new
  /products/[id]/edit
/transactions
  /transactions/new
  /transactions/[id]
  /transactions/[id]/edit
/recap
  /recap/customer/[id]
  /recap/type/[lm|br]
  /recap/overall
```

---

## 7. Metrics for v1 Success

These aren't analytics dashboards. Just sanity checks post-launch:

- Discount calculation: zero manual corrections needed after app is live
- Settlement errors: zero rollback failures in first 3 months
- PDF generation: no timeouts reported
- Operator adoption: replaces spreadsheet within 2 weeks of go-live

---

## 8. Open Questions (v1 Parking Lot)

| Question | Status |
|---|---|
| Should Harga Modal be editable after transactions exist? | Decided: yes, but snapshots on transaction_lines prevent retroactive changes to history |
| Should settled months be re-openable? | Decided: no. Once Lunas, not re-settled. |
| Does the app need a mobile-native feel (PWA)? | Deferred to v2 |
| Multi-month settle (e.g., settle Jan + Feb at once)? | Out of scope v1 |
