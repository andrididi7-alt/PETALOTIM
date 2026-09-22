# Database PostgreSQL PETA-LOTIM

Folder ini berisi fondasi database untuk backend PETA-LOTIM.

## 1. Buat Database

```sql
CREATE DATABASE peta_lotim;
```

## 2. Isi `.env` di Root Project

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/peta_lotim
PGSSL=false
VITE_GOOGLE_MAPS_API_KEY=API_KEY_GOOGLE_MAPS_ANDA
```

Ganti `postgres`, `password`, host, dan port sesuai instalasi PostgreSQL Anda.

## 3. Jalankan Migrasi dan Seed

```bash
npm.cmd run db:migrate
```

Perintah ini menjalankan:

- `database/schema.sql` untuk membuat tabel.
- `database/seed.sql` untuk mengisi data awal.

## 4. Jalankan Backend

```bash
npm.cmd run backend
```

Backend memakai PostgreSQL jika `DATABASE_URL` sudah diisi. Jika belum diisi, backend tetap memakai `server/data.json` sebagai fallback lokal.

## Akun Awal

```text
Username: admin
Password: admin123
Role: Super Admin
```

## Tabel Utama

- `app_info`
- `admin_users`
- `users`
- `roles`
- `categories`
- `schemes`
- `assets`
- `locations`
- `opportunities`
- `utilization_submissions`
- `partnerships`
- `contracts`
- `payments`
- `asset_appraisals`
- `potential_values`
- `pad_revenues`
- `financial_reports`
- `asset_monitorings`
- `statistical_reports`
- `articles`
