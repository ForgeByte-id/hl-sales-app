# HL Sales & Receivables Management App

Aplikasi internal untuk mencatat pelanggan, produk, bon, piutang, pelunasan, dan rekap penjualan.

## Setup

Install dependency:

```bash
npm install
```

Salin contoh konfigurasi:

```bash
cp .env.local.example .env.local
```

Isi `.env.local`:

```bash
SUPABASE_URL=
SUPABASE_KEY=
```

Catatan:

- `SUPABASE_KEY` adalah key publik untuk aplikasi.

## Import Tabel

Schema database ada di:

```bash
supabase/migrations/20260609000000_init_hl_schema.sql
```

Jika Supabase CLI tersedia:

```bash
supabase link --project-ref PROJECT_REF
supabase db push
```

Jika Supabase CLI belum tersedia, buka SQL Editor di dashboard Supabase, lalu jalankan isi file migration tersebut.

## Seed User Awal SQL

File seed user ada di:

```bash
supabase/seed.sql
```

Sebelum menjalankan, buka file tersebut lalu ganti nilai berikut:

```sql
seed_email text := 'owner@example.com';
seed_password text := 'change-me-12345';
seed_name text := 'Pemilik';
```

Jalankan isi `supabase/seed.sql` dari SQL Editor setelah tabel selesai dibuat.

## Jalankan Aplikasi

```bash
npm run dev
```

Buka:

```bash
http://127.0.0.1:3000
```

## Build

```bash
npm run build
```
