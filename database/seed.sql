INSERT INTO app_info (
  id,
  app_name,
  app_subtitle,
  agency_name,
  about_title,
  about_description,
  contact_title,
  contact_description,
  address,
  phone,
  email,
  website,
  footer_text
) VALUES (
  1,
  'PETA-LOTIM',
  'Portal Elektronik Lombok Timur',
  'Pemerintah Kabupaten Lombok Timur',
  'Tentang PETA-LOTIM',
  'PETA-LOTIM adalah portal informasi dan pengelolaan pemanfaatan aset daerah Kabupaten Lombok Timur.',
  'Kontak PETA-LOTIM',
  'Hubungi pengelola portal untuk informasi kerja sama, pemanfaatan aset, dan layanan data aset daerah.',
  'Kompleks Kantor Bupati Lombok Timur, Selong',
  '(0376) 000000',
  'aset@lomboktimurkab.go.id',
  'https://lomboktimurkab.go.id',
  '© 2024 Portal Kabupaten Lombok Timur. All rights reserved.'
) ON CONFLICT (id) DO UPDATE SET
  app_name = EXCLUDED.app_name,
  app_subtitle = EXCLUDED.app_subtitle,
  agency_name = EXCLUDED.agency_name,
  about_title = EXCLUDED.about_title,
  about_description = EXCLUDED.about_description,
  contact_title = EXCLUDED.contact_title,
  contact_description = EXCLUDED.contact_description,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  footer_text = EXCLUDED.footer_text,
  updated_at = NOW();

INSERT INTO roles (name, description, permissions, status)
VALUES
  (
    'Super Admin',
    'Akses penuh seluruh modul dan pengaturan sistem.',
    '["Lihat Dashboard","Kelola Aset","Kelola Kategori","Kelola Lokasi","Kelola Skema","Kelola Pengguna","Kelola Role","Kelola Komersialisasi","Kelola Keuangan","Kelola Monitoring","Kelola Artikel","Verifikasi Pengajuan","Laporan"]'::jsonb,
    'Aktif'
  ),
  (
    'Operator Aset',
    'Mengelola data aset, lokasi, kategori, skema, artikel, dan laporan operasional.',
    '["Lihat Dashboard","Kelola Aset","Kelola Kategori","Kelola Lokasi","Kelola Skema","Kelola Artikel","Laporan"]'::jsonb,
    'Aktif'
  ),
  (
    'Viewer',
    'Hanya dapat melihat dashboard dan laporan.',
    '["Lihat Dashboard","Laporan"]'::jsonb,
    'Aktif'
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO admin_users (username, password_text, name, role, notifications)
VALUES ('admin', 'admin123', 'Admin', 'Super Admin', 5)
ON CONFLICT (username) DO UPDATE SET
  password_text = EXCLUDED.password_text,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  notifications = EXCLUDED.notifications;

INSERT INTO users (name, username, password_text, email, role, unit, status, last_login)
VALUES
  ('Admin', 'admin', 'admin123', 'admin@lotim.go.id', 'Super Admin', 'BPKAD', 'Aktif', 'Hari ini'),
  ('Operator Aset', 'operator', 'operator123', 'operator@lotim.go.id', 'Operator Aset', 'Bidang Aset', 'Aktif', 'Kemarin'),
  ('Viewer', 'viewer', 'viewer123', 'viewer@lotim.go.id', 'Viewer', 'OPD', 'Aktif', '-')
ON CONFLICT (username) DO UPDATE SET
  name = EXCLUDED.name,
  password_text = EXCLUDED.password_text,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  unit = EXCLUDED.unit,
  status = EXCLUDED.status,
  last_login = EXCLUDED.last_login,
  updated_at = NOW();

INSERT INTO categories (name, icon, color, description, status)
VALUES
  ('Tanah', 'map-pin', '#047857', 'Aset berupa lahan dan tanah daerah.', 'Aktif'),
  ('Gedung', 'building', '#2563eb', 'Aset bangunan gedung milik daerah.', 'Aktif'),
  ('JARINGAN', 'network', '#0f766e', 'Aset jaringan dan infrastruktur pendukung.', 'Aktif'),
  ('Aset Tetap Lain', 'archive', '#f59e0b', 'Aset tetap lain milik daerah.', 'Aktif')
ON CONFLICT (name) DO UPDATE SET
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO schemes (name, description, duration, status)
VALUES
  ('Sewa', 'Pemanfaatan aset melalui pembayaran sewa.', '1-5 tahun', 'Aktif'),
  ('Kerja Sama Pemanfaatan', 'Kerja sama pemanfaatan aset daerah dengan mitra.', '5-30 tahun', 'Aktif'),
  ('Bangun Guna Serah (BGS)', 'Pembangunan oleh mitra lalu diserahkan kembali kepada pemerintah daerah.', 'Sesuai perjanjian', 'Aktif'),
  ('Pinjam Pakai', 'Pemanfaatan aset untuk kebutuhan tertentu tanpa imbalan komersial.', 'Sesuai ketentuan', 'Aktif')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  duration = EXCLUDED.duration,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO assets (idpemda, name, opd_name, category, scheme, status, value_per_year, description, photo_url)
VALUES
  ('79999877', 'Gedung Eks Kantor Bupati', 'BPKAD Lombok Timur', 'Gedung', 'Sewa', 'Tersedia', 12500000000, 'Gedung perkantoran strategis di Selong.', ''),
  ('79999878', 'Tanah Komersial Jl. Sudirman', 'BPKAD Lombok Timur', 'Tanah', 'Kerja Sama Pemanfaatan', 'Dalam Proses', 25000000000, 'Lahan komersial di koridor utama Selong.', ''),
  ('79999879', 'Pasar Tradisional Pancor', 'Disperindag', 'Gedung', 'Bangun Guna Serah (BGS)', 'Terkontrak', 6800000000, 'Kawasan pasar dengan potensi perdagangan tinggi.', ''),
  ('79999880', 'Gudang Strategis Pringgabaya', 'Disperindag', 'Gedung', 'Sewa', 'Tersedia', 4200000000, 'Gudang strategis kawasan Pringgabaya.', ''),
  ('79999881', 'Tanah Labuhan Haji', 'BPKAD Lombok Timur', 'Tanah', 'Kerja Sama Pemanfaatan', 'Tersedia', 5600000000, 'Lahan pendukung aktivitas pelabuhan dan ekonomi pesisir.', '')
ON CONFLICT (idpemda) DO UPDATE SET
  name = EXCLUDED.name,
  opd_name = EXCLUDED.opd_name,
  category = EXCLUDED.category,
  scheme = EXCLUDED.scheme,
  status = EXCLUDED.status,
  value_per_year = EXCLUDED.value_per_year,
  description = EXCLUDED.description,
  photo_url = EXCLUDED.photo_url,
  updated_at = NOW();

INSERT INTO locations (idpemda, name, district, address, description, asset_count, strategic, status, lat, lng, photo_url)
VALUES
  ('79999877', 'Gedung Eks Kantor Bupati', 'Selong', 'Kompleks Kantor Bupati Lombok Timur, Selong, Kabupaten Lombok Timur', 'Kawasan pusat pemerintahan Kabupaten Lombok Timur.', 1, TRUE, 'Aktif', -8.649800, 116.534100, ''),
  ('79999878', 'Tanah Komersial Jl. Sudirman', 'Selong', 'Jl. Sudirman, Selong, Kabupaten Lombok Timur', 'Koridor komersial utama di Selong.', 1, TRUE, 'Aktif', -8.650200, 116.529400, ''),
  ('79999879', 'Pasar Tradisional Pancor', 'Sakra Timur', 'Jl. Raya Pancor, Kecamatan Sakra Timur, Kabupaten Lombok Timur', 'Area Pasar Tradisional Pancor.', 1, TRUE, 'Aktif', -8.635600, 116.541700, ''),
  ('79999880', 'Gudang Strategis Pringgabaya', 'Pringgabaya', 'Kawasan Pergudangan Pringgabaya, Kabupaten Lombok Timur', 'Kawasan pergudangan strategis.', 1, FALSE, 'Aktif', -8.520800, 116.626200, ''),
  ('79999881', 'Tanah Labuhan Haji', 'Labuhan Haji', 'Labuhan Haji, Kabupaten Lombok Timur', 'Area pesisir dan pelabuhan Labuhan Haji.', 1, TRUE, 'Aktif', -8.499500, 116.665800, '')
ON CONFLICT (idpemda) DO UPDATE SET
  name = EXCLUDED.name,
  district = EXCLUDED.district,
  address = EXCLUDED.address,
  description = EXCLUDED.description,
  asset_count = EXCLUDED.asset_count,
  strategic = EXCLUDED.strategic,
  status = EXCLUDED.status,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  photo_url = EXCLUDED.photo_url,
  updated_at = NOW();

INSERT INTO opportunities (name, category, location, scheme, potential_value, status, notes)
VALUES
  ('Peluang Pemanfaatan Tanah Sudirman', 'Tanah', 'Selong', 'Kerja Sama Pemanfaatan', 25000000000, 'Aktif', 'Siap ditawarkan kepada calon mitra.'),
  ('Optimalisasi Gudang Pringgabaya', 'Gedung', 'Pringgabaya', 'Sewa', 4200000000, 'Aktif', 'Dapat dimanfaatkan untuk logistik.')
ON CONFLICT DO NOTHING;

INSERT INTO utilization_submissions (asset_name, applicant, scheme, submission_date, status, notes)
VALUES
  ('Tanah Komersial Jl. Sudirman', 'PT Maju Bersama', 'Kerja Sama Pemanfaatan', '20 Mei 2024', 'Menunggu Verifikasi', ''),
  ('Pasar Tradisional Pancor', 'CV Sejahtera', 'Sewa', '19 Mei 2024', 'Proses Evaluasi', '')
ON CONFLICT DO NOTHING;

INSERT INTO partnerships (name, partner, asset_name, start_date, end_date, status)
VALUES
  ('Kerja Sama Pasar Pancor', 'CV Sejahtera', 'Pasar Tradisional Pancor', '01/01/2026', '31/12/2030', 'Aktif')
ON CONFLICT DO NOTHING;

INSERT INTO contracts (number, partner, asset_name, contract_value, signed_date, start_date, end_date, status, pdf_name, pdf_url)
VALUES
  ('KTR/LOTIM/001/2024', 'PT Maju Bersama', 'Tanah Komersial Jl. Sudirman', 25000000000, '01 Juni 2024', '01/01/2026', '31/12/2030', 'Aktif', '', ''),
  ('KTR/LOTIM/002/2024', 'CV Sejahtera', 'Pasar Tradisional Pancor', 6800000000, '12 Juni 2024', '01/02/2026', '31/01/2031', 'Aktif', '', '')
ON CONFLICT (number) DO UPDATE SET
  partner = EXCLUDED.partner,
  asset_name = EXCLUDED.asset_name,
  contract_value = EXCLUDED.contract_value,
  signed_date = EXCLUDED.signed_date,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  status = EXCLUDED.status,
  pdf_name = EXCLUDED.pdf_name,
  pdf_url = EXCLUDED.pdf_url,
  updated_at = NOW();

INSERT INTO payments (name, partner, asset_name, amount, payment_date, status)
VALUES
  ('Setoran Sewa Gedung Eks Kantor Bupati', 'PT Cipta Karya', 'Gedung Eks Kantor Bupati', 125000000, '30 Juni 2024', 'Lunas'),
  ('Setoran Pasar Pancor', 'CV Sejahtera', 'Pasar Tradisional Pancor', 68000000, '30 Juni 2024', 'Lunas')
ON CONFLICT DO NOTHING;

INSERT INTO asset_appraisals (asset_name, appraiser, appraisal_value, appraisal_date, status)
VALUES
  ('Gedung Eks Kantor Bupati', 'KJPP Lotim', 12500000000, '10 Juni 2024', 'Selesai'),
  ('Tanah Komersial Jl. Sudirman', 'KJPP Lotim', 25000000000, '11 Juni 2024', 'Selesai')
ON CONFLICT DO NOTHING;

INSERT INTO potential_values (asset_name, category, potential_value, period, status)
VALUES
  ('Gedung Eks Kantor Bupati', 'Gedung', 12500000000, '2026', 'Aktif'),
  ('Tanah Komersial Jl. Sudirman', 'Tanah', 25000000000, '2026', 'Aktif')
ON CONFLICT DO NOTHING;

INSERT INTO pad_revenues (name, period, target_value, realization_value, status)
VALUES
  ('PAD Pemanfaatan Aset', '2026', 152700000000, 68400000000, 'Aktif')
ON CONFLICT DO NOTHING;

INSERT INTO financial_reports (name, period, report_type, prepared_by, published_date, status, file_url)
VALUES
  ('Laporan Realisasi PAD Semester I', 'Semester I 2024', 'Realisasi PAD', 'BPKAD', '30 Juni 2024', 'Terbit', ''),
  ('Laporan Potensi Aset Daerah', 'Triwulan II 2024', 'Potensi Aset', 'Bidang Aset', '25 Juni 2024', 'Terbit', ''),
  ('Laporan Piutang Pemanfaatan Aset', 'Juni 2024', 'Piutang', 'Bendahara Penerimaan', '', 'Draft', '')
ON CONFLICT DO NOTHING;

INSERT INTO asset_monitorings (asset_name, inspector, monitoring_date, condition_status, status, notes)
VALUES
  ('Gedung Eks Kantor Bupati', 'Tim Monitoring BPKAD', '18 Juni 2024', 'Baik', 'Aktif', 'Kondisi bangunan baik.'),
  ('Gudang Strategis Pringgabaya', 'Tim Monitoring BPKAD', '20 Juni 2024', 'Baik', 'Aktif', 'Perlu pengecekan berkala.')
ON CONFLICT DO NOTHING;

INSERT INTO statistical_reports (name, period, report_type, status, data)
VALUES
  ('Statistik Aset Daerah', '2026', 'Dashboard Statistik', 'Aktif', '{"totalAssets":12486,"totalValue":"Rp 7,85 T","certified":9850,"uncertified":2636}'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO articles (title, category, author, published_date, summary, content, image_url, images, hot_topic, status)
VALUES
  (
    'Update Data Lokasi Aset Berbasis Koordinat',
    'Pengumuman',
    'Admin',
    '12 Juli 2026',
    'Data lokasi aset kini dapat ditampilkan melalui peta sehingga publik bisa melihat sebaran aset secara visual.',
    'Pemerintah Kabupaten Lombok Timur memperbarui data lokasi aset berbasis koordinat untuk meningkatkan transparansi. Melalui PETA-LOTIM, masyarakat dan calon mitra dapat melihat lokasi, kategori, skema pemanfaatan, serta peluang kerja sama secara lebih mudah.',
    '',
    '[]'::jsonb,
    TRUE,
    'Terbit'
  ),
  (
    'Pemanfaatan Aset Daerah Diperkuat Melalui Digitalisasi',
    'Berita',
    'Bidang Aset',
    '18 Juli 2026',
    'Portal elektronik membantu masyarakat dan calon mitra melihat informasi aset daerah secara lebih mudah.',
    'Digitalisasi pemanfaatan aset daerah menjadi langkah penting untuk membuka akses informasi, mempercepat layanan, dan mendukung peningkatan PAD Kabupaten Lombok Timur.',
    '',
    '[]'::jsonb,
    TRUE,
    'Terbit'
  ),
  (
    'Peluang Investasi Aset Strategis Lombok Timur',
    'Artikel',
    'Bidang Aset',
    '15 Juli 2026',
    'Sejumlah aset strategis disiapkan untuk mendukung kerja sama pemanfaatan yang produktif.',
    'Aset strategis seperti tanah komersial, pasar, gudang, dan kawasan wisata dapat menjadi peluang investasi yang memberi manfaat ekonomi bagi daerah dan mitra.',
    '',
    '[]'::jsonb,
    TRUE,
    'Terbit'
  )
ON CONFLICT DO NOTHING;
