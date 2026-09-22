CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_info (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  app_name VARCHAR(160) NOT NULL DEFAULT 'PETA-LOTIM',
  app_subtitle VARCHAR(220) NOT NULL DEFAULT 'Portal Elektronik Lombok Timur',
  agency_name VARCHAR(220) NOT NULL DEFAULT 'Pemerintah Kabupaten Lombok Timur',
  about_title VARCHAR(220) NOT NULL DEFAULT 'Tentang Aplikasi',
  about_description TEXT NOT NULL DEFAULT '',
  contact_title VARCHAR(220) NOT NULL DEFAULT 'Kontak Kami',
  contact_description TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone VARCHAR(80) NOT NULL DEFAULT '',
  email VARCHAR(160) NOT NULL DEFAULT '',
  website VARCHAR(180) NOT NULL DEFAULT '',
  footer_text TEXT NOT NULL DEFAULT '© 2024 Portal Kabupaten Lombok Timur. All rights reserved.',
  logo_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT app_info_single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_text VARCHAR(120) NOT NULL,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(120) NOT NULL,
  notifications INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(40) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_text VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL DEFAULT '',
  role VARCHAR(120) NOT NULL REFERENCES roles(name) ON UPDATE CASCADE,
  unit VARCHAR(140) NOT NULL DEFAULT '',
  status VARCHAR(40) NOT NULL DEFAULT 'Aktif',
  last_login VARCHAR(80) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  icon VARCHAR(80) NOT NULL DEFAULT 'folder',
  color VARCHAR(40) NOT NULL DEFAULT '#0f766e',
  description TEXT NOT NULL DEFAULT '',
  status VARCHAR(40) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schemes (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(140) UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration VARCHAR(80) NOT NULL DEFAULT '',
  status VARCHAR(40) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id BIGSERIAL PRIMARY KEY,
  idpemda VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(220) NOT NULL,
  opd_name VARCHAR(180) NOT NULL DEFAULT '',
  category VARCHAR(120) NOT NULL REFERENCES categories(name) ON UPDATE CASCADE,
  scheme VARCHAR(140) NOT NULL REFERENCES schemes(name) ON UPDATE CASCADE,
  status VARCHAR(60) NOT NULL DEFAULT 'Tersedia',
  value_per_year NUMERIC(18, 2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  photo_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id BIGSERIAL PRIMARY KEY,
  idpemda VARCHAR(80) UNIQUE REFERENCES assets(idpemda) ON UPDATE CASCADE ON DELETE CASCADE,
  name VARCHAR(220) NOT NULL,
  district VARCHAR(120) NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  asset_count INTEGER NOT NULL DEFAULT 1,
  strategic BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(40) NOT NULL DEFAULT 'Aktif',
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),
  photo_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opportunities (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(220) NOT NULL,
  category VARCHAR(120) NOT NULL DEFAULT '',
  location VARCHAR(220) NOT NULL DEFAULT '',
  scheme VARCHAR(140) NOT NULL DEFAULT '',
  potential_value NUMERIC(18, 2) NOT NULL DEFAULT 0,
  status VARCHAR(60) NOT NULL DEFAULT 'Aktif',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS utilization_submissions (
  id BIGSERIAL PRIMARY KEY,
  asset_name VARCHAR(220) NOT NULL,
  applicant VARCHAR(180) NOT NULL,
  scheme VARCHAR(140) NOT NULL DEFAULT '',
  submission_date VARCHAR(80) NOT NULL DEFAULT '',
  status VARCHAR(80) NOT NULL DEFAULT 'Menunggu Verifikasi',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partnerships (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(220) NOT NULL,
  partner VARCHAR(180) NOT NULL DEFAULT '',
  asset_name VARCHAR(220) NOT NULL DEFAULT '',
  start_date VARCHAR(80) NOT NULL DEFAULT '',
  end_date VARCHAR(80) NOT NULL DEFAULT '',
  status VARCHAR(60) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
  id BIGSERIAL PRIMARY KEY,
  number VARCHAR(120) UNIQUE NOT NULL,
  partner VARCHAR(180) NOT NULL,
  asset_name VARCHAR(220) NOT NULL,
  contract_value NUMERIC(18, 2) NOT NULL DEFAULT 0,
  signed_date VARCHAR(80) NOT NULL DEFAULT '',
  start_date VARCHAR(80) NOT NULL DEFAULT '',
  end_date VARCHAR(80) NOT NULL DEFAULT '',
  status VARCHAR(60) NOT NULL DEFAULT 'Aktif',
  pdf_name TEXT NOT NULL DEFAULT '',
  pdf_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(220) NOT NULL,
  partner VARCHAR(180) NOT NULL DEFAULT '',
  asset_name VARCHAR(220) NOT NULL DEFAULT '',
  amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  payment_date VARCHAR(80) NOT NULL DEFAULT '',
  status VARCHAR(60) NOT NULL DEFAULT 'Belum Lunas',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_appraisals (
  id BIGSERIAL PRIMARY KEY,
  asset_name VARCHAR(220) NOT NULL,
  appraiser VARCHAR(180) NOT NULL DEFAULT '',
  appraisal_value NUMERIC(18, 2) NOT NULL DEFAULT 0,
  appraisal_date VARCHAR(80) NOT NULL DEFAULT '',
  status VARCHAR(60) NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS potential_values (
  id BIGSERIAL PRIMARY KEY,
  asset_name VARCHAR(220) NOT NULL,
  category VARCHAR(120) NOT NULL DEFAULT '',
  potential_value NUMERIC(18, 2) NOT NULL DEFAULT 0,
  period VARCHAR(80) NOT NULL DEFAULT '',
  status VARCHAR(60) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pad_revenues (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(220) NOT NULL,
  period VARCHAR(80) NOT NULL DEFAULT '',
  target_value NUMERIC(18, 2) NOT NULL DEFAULT 0,
  realization_value NUMERIC(18, 2) NOT NULL DEFAULT 0,
  status VARCHAR(60) NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_reports (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(220) NOT NULL,
  period VARCHAR(120) NOT NULL DEFAULT '',
  report_type VARCHAR(120) NOT NULL DEFAULT '',
  prepared_by VARCHAR(180) NOT NULL DEFAULT '',
  published_date VARCHAR(80) NOT NULL DEFAULT '',
  status VARCHAR(60) NOT NULL DEFAULT 'Draft',
  file_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_monitorings (
  id BIGSERIAL PRIMARY KEY,
  asset_name VARCHAR(220) NOT NULL,
  inspector VARCHAR(180) NOT NULL DEFAULT '',
  monitoring_date VARCHAR(80) NOT NULL DEFAULT '',
  condition_status VARCHAR(80) NOT NULL DEFAULT '',
  status VARCHAR(60) NOT NULL DEFAULT 'Aktif',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS statistical_reports (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(220) NOT NULL,
  period VARCHAR(120) NOT NULL DEFAULT '',
  report_type VARCHAR(120) NOT NULL DEFAULT '',
  status VARCHAR(60) NOT NULL DEFAULT 'Aktif',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(260) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'Berita',
  author VARCHAR(140) NOT NULL DEFAULT 'Admin',
  published_date VARCHAR(80) NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  hot_topic BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(40) NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_idpemda ON assets (idpemda);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets (category);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets (status);
CREATE INDEX IF NOT EXISTS idx_locations_idpemda ON locations (idpemda);
CREATE INDEX IF NOT EXISTS idx_locations_district ON locations (district);
CREATE INDEX IF NOT EXISTS idx_locations_status ON locations (status);
CREATE INDEX IF NOT EXISTS idx_articles_hot_status ON articles (hot_topic, status);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts (status);

ALTER TABLE locations ADD COLUMN IF NOT EXISTS idpemda VARCHAR(80);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS photo_url TEXT NOT NULL DEFAULT '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint constraint_info
    JOIN pg_attribute column_info
      ON column_info.attrelid = constraint_info.conrelid
      AND column_info.attnum = ANY (constraint_info.conkey)
    WHERE constraint_info.conrelid = 'locations'::regclass
      AND constraint_info.contype = 'u'
      AND column_info.attname = 'idpemda'
  ) THEN
    ALTER TABLE locations ADD CONSTRAINT locations_idpemda_unique UNIQUE (idpemda);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint constraint_info
    JOIN pg_attribute column_info
      ON column_info.attrelid = constraint_info.conrelid
      AND column_info.attnum = ANY (constraint_info.conkey)
    WHERE constraint_info.conrelid = 'locations'::regclass
      AND constraint_info.contype = 'f'
      AND column_info.attname = 'idpemda'
  ) THEN
    ALTER TABLE locations
      ADD CONSTRAINT locations_idpemda_assets_fk
      FOREIGN KEY (idpemda) REFERENCES assets(idpemda)
      ON UPDATE CASCADE ON DELETE CASCADE;
  END IF;
END $$;
