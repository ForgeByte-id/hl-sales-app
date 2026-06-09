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
SUPABASE_SERVICE_ROLE_KEY=

SEED_USER_EMAIL=
SEED_USER_PASSWORD=
SEED_USER_NAME=Pemilik
```

Catatan:

- `SUPABASE_KEY` adalah key publik untuk aplikasi.
- `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai untuk menjalankan seed user dari terminal. Jangan dipakai di tampilan aplikasi.
- `SEED_USER_PASSWORD` minimal 8 karakter.

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

## Seed User Awal

Setelah tabel selesai dibuat dan `.env.local` sudah diisi:

```bash
npm run db:seed:user
```

Script ini akan:

- membuat user baru jika email belum ada;
- memperbarui password jika email sudah ada;
- menandai email sebagai sudah terkonfirmasi.

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
