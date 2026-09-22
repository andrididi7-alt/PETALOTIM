import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import heroImage from "./assets/lombok-hero.png";
import assetSprite from "./assets/asset-sprite.png";
import lombokTimurLogo from "./assets/lombok-timur-logo.png";

const navItems = [
  ["home", "Beranda", "/"],
  ["compass", "Aset Dimanfaatkan", "/jelajah-aset"],
  ["star", "Aset Unggulan", "/aset-unggulan"],
  ["spark", "Aset Baru", "/aset-baru"],
  ["map", "Peta Aset", "/peta-aset"],
  ["chart", "Peluang Investasi", "/peluang-investasi"],
  ["doc", "Pengumuman & Berita", "/pengumuman-berita-artikel"],
  ["info", "Tentang Kami", "/tentang-kami"],
];

const benefits = [
  ["shield", "Transparan", "Informasi aset terbuka dan dapat dipercaya"],
  ["user", "Profesional", "Proses komersialisasi sesuai regulasi yang berlaku"],
  ["growth", "Menguntungkan", "Maksimalkan nilai aset untuk peningkatan PAD"],
  ["leaf", "Berkelanjutan", "Pemanfaatan aset untuk kemakmuran daerah"],
];

const assets = [
  {
    title: "Gedung Eks Kantor Bupati",
    meta: "Gedung Perkantoran",
    location: "Selong, Lombok Timur",
    area: "2.450 m²",
    potential: "Kawasan pusat kota yang representatif untuk perkantoran terpadu, coworking space, atau perbankan.",
    scheme: "Sewa",
    value: "Rp 12,5 M / tahun",
    pos: "0% 0%",
  },
  {
    title: "Tanah Komersial Jl. Sudirman",
    meta: "Tanah Strategis",
    location: "Selong, Lombok Timur",
    area: "8.500 m²",
    potential: "Sangat strategis di jalan protokol untuk pembangunan mall, perhotelan, atau pusat perbelanjaan modern.",
    scheme: "Kerja Sama Pemanfaatan",
    value: "Rp 25 M / tahun",
    pos: "100% 0%",
  },
  {
    title: "Pasar Tradisional Pancor",
    meta: "Pasar",
    location: "Pancor, Lombok Timur",
    area: "5.200 m²",
    potential: "Pusat aktivitas ekonomi warga, cocok untuk modernisasi pasar rakyat, pusat kuliner, dan sentra komoditas.",
    scheme: "Bangun Guna Serah (BGS)",
    value: "Rp 6,8 M / tahun",
    pos: "0% 100%",
  },
  {
    title: "Gudang Strategis",
    meta: "Bangunan",
    location: "Pringgabaya, Lombok Timur",
    area: "3.000 m²",
    potential: "Dekat dengan pelabuhan dan jalur logistik, ideal untuk pergudangan ekspedisi, cold storage, dan pusat distribusi.",
    scheme: "Sewa",
    value: "Rp 4,2 M / tahun",
    pos: "100% 100%",
  },
];

const stats = [
  ["building", "Total Aset", "1.248", "blue"],
  ["money", "Nilai Potensi (per tahun)", "Rp 152,7 M", "green"],
  ["office", "Pemerintah Daerah", "346", "purple"],
  ["box", "Aset Tersedia", "278", "orange"],
];

const categories = [
  ["tree", "Tanah"],
  ["building", "Gedung"],
  ["office", "Perkantoran"],
  ["store", "Pasar"],
  ["flag", "Pariwisata"],
  ["ball", "Sarana Olahraga"],
  ["anchor", "Pelabuhan"],
  ["plus", "Lainnya"],
];

const categoryIcons = {
  tanah: "tree",
  gedung: "building",
  bangunan: "building",
  perkantoran: "office",
  pasar: "store",
  pariwisata: "flag",
  olahraga: "ball",
  pelabuhan: "anchor",
};

function getCategoryIcon(label, index = 0) {
  const normalized = String(label || "").toLowerCase();
  const match = Object.entries(categoryIcons).find(([keyword]) => normalized.includes(keyword));
  return match?.[1] || ["tree", "building", "office", "store", "flag", "ball", "anchor", "plus"][index % 8];
}

function goToPublicPath(path, event) {
  event?.preventDefault();
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function brandSubtitle(info = appInfo) {
  if (info.tagline) return info.tagline;
  if (info.description?.toLowerCase().includes("portal elektronik lombok timur")) return "Portal Elektronik Lombok Timur";
  return "Portal Elektronik Lombok Timur";
}

function BrandBlock({ info = appInfo, logoClassName = "brand-logo" }) {
  const title = info.shortName || info.name || appInfo.shortName;
  const subtitle = brandSubtitle(info);
  const [firstLine, ...rest] = subtitle.split(/\s+(?=Lombok Timur$)/);
  const logoSource = info.logoUrl || lombokTimurLogo;

  return (
    <div className="brand">
      <img className={logoClassName} src={logoSource} alt="Logo Kabupaten Lombok Timur" />
      <div>
        <div className="brand-title">{title}</div>
        <div className="brand-subtitle">{firstLine}<br />{rest.join(" ") || "Lombok Timur"}</div>
      </div>
    </div>
  );
}

function Icon({ name }) {
  const paths = {
    home: "M3 11.5 12 4l9 7.5v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
    compass: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.6 5.4-2.1 5.1-5.1 2.1 2.1-5.1z",
    star: "m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
    spark: "M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z",
    map: "M4 6.5 9 4l6 2.5 5-2.5v13.5L15 20l-6-2.5-5 2.5zM9 4v13.5M15 6.5V20",
    chart: "M5 19V9h4v10M10 19V5h4v14M15 19v-7h4v7",
    doc: "M6 3h9l3 3v15H6zM14 3v4h4M9 11h6M9 15h6",
    info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 10v6M12 7.5h.01",
    search: "M11 19a8 8 0 1 1 5.3-14l4.3 4.3-1.4 1.4-4.3-4.3A6 6 0 1 0 17 17z",
    bell: "M18 16H6l1.5-2.2V10a4.5 4.5 0 0 1 9 0v3.8zM10 19a2 2 0 0 0 4 0",
    help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.8 9a2.3 2.3 0 0 1 4.4 1c0 2-2.2 2-2.2 4M12 17h.01",
    shield: "M12 3 19 6v5c0 4.4-2.8 7.6-7 10-4.2-2.4-7-5.6-7-10V6zM9 12l2 2 4-5",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
    growth: "M4 19h16M6 16v-5M11 16V8M16 16V5M6 11l5-3 5-3",
    leaf: "M20 4c-8 0-13 4-13 11 0 3 2 5 5 5 7 0 8-8 8-16ZM7 17c3-1 5-3 8-7",
    heart: "M12 20s-8-4.6-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.4-8 10-8 10Z",
    pin: "M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    building: "M4 21V5h9v16M13 9h7v12M7 8h3M7 12h3M7 16h3M16 13h2M16 17h2",
    money: "M4 7h16v12H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM7 10v6M17 10v6",
    handshake: "M8 12l3 3a2 2 0 0 0 3 0l4-4M3 12l4-4 4 4M21 12l-4-4-3 3M7 8h7M5 16l3 3M19 16l-3 3",
    menu: "M4 6h16M4 12h16M4 18h16",
    chevron: "m9 6 6 6-6 6",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    check: "M20 6 9 17l-5-5",
    download: "M12 3v12M8 11l4 4 4-4M4 21h16",
    upload: "M12 21V9M8 13l4-4 4 4M4 3h16",
    image: "M4 5h16v14H4zM8 13l2-2 3 3 2-2 3 4M8.5 9.5h.01",
    folder: "M3 6h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6z",
    receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h4",
    calculator: "M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2",
    monitor: "M3 5h18v12H3zM9 21h6M12 17v4",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.4 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L5 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 3.1h5l.4-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z",
    hourglass: "M6 3h12M6 21h12M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9",
    filter: "M4 5h16l-6 7v5l-4 2v-7z",
    edit: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4",
    trash: "M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3",
    target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
    office: "M3 21h18M5 21V7l7-4 7 4v14M9 10h2M13 10h2M9 14h2M13 14h2",
    box: "M4 7l8-4 8 4-8 4zM4 7v10l8 4 8-4V7M12 11v10",
    tree: "M12 4c3 0 5 2 5 5a5 5 0 0 1-3 4.6V20h-4v-6.4A5 5 0 0 1 7 9c0-3 2-5 5-5Z",
    store: "M4 10h16l-1-5H5zM6 10v10h12V10M8 14h8",
    flag: "M6 21V4h11l-2 4 2 4H6",
    ball: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16",
    anchor: "M12 4v13M8 8h8M6 13a6 6 0 0 0 12 0M9 18l-3-3M15 18l3-3",
    plus: "M12 5v14M5 12h14",
    tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
    phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="icon">
      <path d={paths[name] || paths.home} />
    </svg>
  );
}

function Header({ path = "/", filters, onFilterChange, onOpenAssetSearch, appInfoData = appInfo }) {
  const goToLogin = () => {
    window.history.pushState({}, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  const topLinks = [
    ["Beranda", "/"],
    ["Aset", "/jelajah-aset"],
    ["Investasi", "/peluang-investasi"],
    ["Informasi", "/pengumuman-berita-artikel"],
    ["Kontak", "/kontak"],
  ];
  const isTopLinkActive = (href) => {
    if (href === "/") return path === "/";
    if (href === "/jelajah-aset") return ["/jelajah-aset", "/aset-unggulan", "/aset-baru", "/peta-aset"].includes(path);
    return path === href;
  };

  return (
    <header className="topbar">
      <BrandBlock info={appInfoData} />

      <label className="global-search">
        <Icon name="search" />
        <input
          value={filters.query}
          onChange={(event) => onFilterChange({ query: event.target.value })}
          onFocus={onOpenAssetSearch}
          onKeyDown={(event) => {
            if (event.key === "Enter") onOpenAssetSearch();
          }}
          placeholder="Cari aset, lokasi, atau kata kunci..."
        />
      </label>

      <nav className="main-nav">
        {topLinks.map(([item, href]) => (
          <a className={isTopLinkActive(href) ? "active" : ""} href={href} onClick={(event) => goToPublicPath(href, event)} key={item}>{item}</a>
        ))}
      </nav>

      <button className="icon-button" aria-label="Notifikasi"><Icon name="bell" /></button>
      <button className="login-button" onClick={goToLogin}>Masuk</button>
    </header>
  );
}

function Sidebar({ path = "/" }) {
  const getNavTag = (label) => {
    if (label === "Aset Unggulan") return <span className="nav-tag hot">Hot</span>;
    if (label === "Aset Baru") return <span className="nav-tag new">Baru</span>;
    if (label === "Peta Aset") return <span className="nav-tag gis">GIS</span>;
    if (label === "Peluang Investasi") return <span className="nav-tag opp">Mitra</span>;
    return null;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-header-badge">
          <Icon name="compass" />
        </div>
        <div className="sidebar-header-text">
          <strong>Navigasi Utama</strong>
          <small>Portal Aset Lombok Timur</small>
        </div>
      </div>

      <nav className="side-nav">
        {navItems.map(([icon, label, href]) => (
          <a
            href={href}
            onClick={(event) => goToPublicPath(href, event)}
            className={path === href ? "selected" : ""}
            key={label}
          >
            <div className="nav-icon-wrap">
              <Icon name={icon} />
            </div>
            <span className="nav-label">{label}</span>
            {getNavTag(label)}
            <span className="nav-arrow">&rsaquo;</span>
          </a>
        ))}
      </nav>

      <div className="promo">
        <div className="promo-badge">
          <span className="promo-dot"></span>
          <Icon name="shield" />
          <span>Komersialisasi Resmi</span>
        </div>
        <div className="city-art">
          <span></span><span></span><span></span><span></span>
        </div>
        <h3>Optimalkan Aset Daerah</h3>
        <p>Peluang kerjasama pemanfaatan aset transparan & produktif untuk kemakmuran Kabupaten Lombok Timur.</p>
        <div className="promo-quick-stats">
          <div><strong>50+</strong><span>Aset Terdata</span></div>
          <div><strong>100%</strong><span>Resmi & Sah</span></div>
        </div>
        <button onClick={(event) => goToPublicPath("/peluang-investasi", event)}>
          Peluang Investasi &rarr;
        </button>
      </div>

      <div className="sidebar-help-card">
        <div className="help-icon-wrap">
          <Icon name="phone" />
        </div>
        <div className="help-info">
          <strong>Layanan Mitra Aset</strong>
          <p>Butuh konsultasi pemanfaatan atau regulasi?</p>
          <a href="/kontak" onClick={(event) => goToPublicPath("/kontak", event)}>
            Hubungi BPKAD &rarr;
          </a>
        </div>
      </div>
    </aside>
  );
}

function Hero({ categoryOptions = [], locationOptions = [], schemeOptions = [], filters, onFilterChange, onApplyFilters }) {
  return (
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,42,93,.98), rgba(7,42,93,.74) 38%, rgba(7,42,93,.08)), url(${heroImage})` }}>
      <div className="hero-copy">
        <h1>Marketplace<br />Komersialisasi Aset Daerah</h1>
        <p>Temukan peluang terbaik pemanfaatan aset daerah secara transparan, profesional, dan menguntungkan.</p>
      </div>
      <div className="search-panel">
        <label className="asset-search">
          <Icon name="search" />
          <input value={filters.query} onChange={(event) => onFilterChange({ query: event.target.value })} placeholder="Cari aset, lokasi, atau kata kunci..." />
        </label>
        <select value={filters.category} onChange={(event) => onFilterChange({ category: event.target.value })}><option value="">Semua Kategori</option>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={filters.location} onChange={(event) => onFilterChange({ location: event.target.value })}><option value="">Semua Lokasi</option>{locationOptions.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={filters.scheme} onChange={(event) => onFilterChange({ scheme: event.target.value })}><option value="">Semua Skema</option>{schemeOptions.map((item) => <option key={item}>{item}</option>)}</select>
        <button onClick={onApplyFilters}>Cari Aset</button>
      </div>
    </section>
  );
}

function AssetCard({ item, onViewDetail }) {
  const photoStyle = item.imageUrl
    ? { backgroundImage: `linear-gradient(180deg, rgba(7, 42, 93, 0.06), rgba(7, 42, 93, 0.1)), url(${item.imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" }
    : { backgroundImage: `url(${assetSprite})`, backgroundPosition: item.pos };

  return (
    <article className="asset-card">
      <div className="asset-photo" style={photoStyle}>
        <span>Unggulan</span>
        <button aria-label="Simpan aset"><Icon name="heart" /></button>
      </div>
      <div className="asset-body">
        <small>{item.meta}</small>
        <h3>{item.title}</h3>
        <p><Icon name="pin" /> {item.location}</p>
        <div className="asset-facts">
          <div><span>Luas Bangunan</span><strong>{item.area}</strong></div>
          <div><span>Skema</span><strong>{item.scheme}</strong></div>
        </div>
        <span className="value-label">Estimasi Nilai</span>
        <strong className="asset-value">{item.value}</strong>
        <button className="detail-button" onClick={() => onViewDetail?.(item)}>Lihat Detail</button>
      </div>
    </article>
  );
}

function Filters({ categoryOptions = [], locationOptions = [], schemeOptions = [], statItems = stats, filters, onFilterChange, onApplyFilters, onResetFilters }) {
  return (
    <aside className="right-panel">
      <section className="panel filter-panel">
        <div className="panel-head">
          <div className="panel-head-title">
            <span className="panel-pulse-dot"></span>
            <h2>Filter & Cari Aset</h2>
          </div>
          <button className="reset-filter-btn" onClick={onResetFilters}>Reset</button>
        </div>

        <div className="quick-filter-chips">
          {["Semua", "Tanah", "Gedung", "Sewa"].map((tag) => (
            <button
              key={tag}
              type="button"
              className={`quick-chip ${(!filters.category && tag === "Semua") || filters.category === tag || filters.scheme === tag ? "active" : ""}`}
              onClick={() => {
                if (tag === "Semua") onFilterChange({ category: "", scheme: "" });
                else if (tag === "Sewa") onFilterChange({ scheme: "Sewa" });
                else onFilterChange({ category: tag });
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <Icon name="tag" />
            <span>Kategori Aset</span>
          </label>
          <select value={filters.category} onChange={(event) => onFilterChange({ category: event.target.value })}>
            <option value="">Semua Kategori</option>
            {categoryOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <Icon name="pin" />
            <span>Lokasi Kecamatan</span>
          </label>
          <select value={filters.location} onChange={(event) => onFilterChange({ location: event.target.value })}>
            <option value="">Semua Lokasi</option>
            {locationOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <Icon name="chart" />
            <span>Skema Kerjasama</span>
          </label>
          <select value={filters.scheme} onChange={(event) => onFilterChange({ scheme: event.target.value })}>
            <option value="">Semua Skema Pemanfaatan</option>
            {schemeOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <label className="range">
          <div className="range-label-wrap">
            <span>Rentang Nilai Aset</span>
            <span className="range-val-badge">≤ {filters.maxValue >= 100 ? "100 M+" : `${filters.maxValue} M`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.maxValue}
            onChange={(event) => onFilterChange({ maxValue: Number(event.target.value) })}
          />
          <div className="range-bounds">
            <span>Rp 0</span>
            <span>Rp 100 M+</span>
          </div>
        </label>

        <button className="apply-button" onClick={onApplyFilters}>
          <Icon name="search" />
          <span>Terapkan Filter</span>
        </button>
      </section>

      <section className="panel stats-panel">
        <div className="stats-panel-header">
          <div className="stats-panel-title">
            <h2>Statistik Aset</h2>
            <small>Kabupaten Lombok Timur</small>
          </div>
          <span className="stats-live-pill">
            <span className="pulse-circle"></span>Live
          </span>
        </div>

        <div className="stats-cards-list">
          {statItems.map(({ icon, label, value, tone }) => (
            <div className={`stat ${tone}`} key={label}>
              <div className="stat-icon-box">
                <Icon name={icon} />
              </div>
              <div className="stat-meta">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
              <span className="stat-pill">Aktif</span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

function usePublicHomeData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/public/home")
      .then((response) => {
        if (!response.ok) throw new Error("API publik belum tersedia");
        return response.json();
      })
      .then((payload) => alive && setData(payload))
      .catch(() => alive && setData(null));
    return () => {
      alive = false;
    };
  }, []);

  return data;
}

function ArticleCard({ item }) {
  return (
    <article className="article-card">
      <span>{item.category}</span>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <div><strong>{item.author}</strong><time>{item.publishedDate}</time></div>
    </article>
  );
}

function openArticlePage(article, event) {
  if (!article?.id) return;
  goToPublicPath(`/baca-berita/${article.id}`, event);
}

function articleMainImage(article) {
  return article?.images?.[0] || article?.imageUrl || heroImage;
}

function ArticleHeroBanner({ articles = [], appInfoData = appInfo }) {
  const hotArticles = articles.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const article = hotArticles[activeIndex] || hotArticles[0];
  const headline = article?.title || appInfoData.name || "PETA-LOTIM";
  const summary = article?.summary || appInfoData.description || appInfo.description;
  const moveSlide = (direction) => {
    if (!hotArticles.length) return;
    setActiveIndex((current) => (current + direction + hotArticles.length) % hotArticles.length);
  };

  return (
    <section className="article-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,42,93,.98), rgba(7,42,93,.76) 48%, rgba(7,42,93,.12)), url(${articleMainImage(article)})` }}>
      <button className="hero-slide-control prev" onClick={() => moveSlide(-1)} aria-label="Berita sebelumnya">&lt;</button>
      <div className="article-hero-copy" onClick={(event) => article && openArticlePage(article, event)}>
        <span>{article?.category || "Artikel & Berita"}</span>
        <h1>{headline}</h1>
        <p>{summary}</p>
        <small>{article?.publishedDate || "Informasi terbaru"} {article?.author ? `- ${article.author}` : ""}</small>
      </div>
      <button className="hero-slide-control next" onClick={() => moveSlide(1)} aria-label="Berita berikutnya">&gt;</button>
      <div className="article-hero-visual" aria-hidden="true">
        {hotArticles.map((item, index) => <i key={item.id || index} className={index === activeIndex ? "active" : ""} style={{ backgroundImage: `url(${articleMainImage(item)})` }}></i>)}
      </div>
      <div className="hero-topic-dots">
        {hotArticles.map((item, index) => <button key={item.id || index} className={index === activeIndex ? "active" : ""} onClick={() => setActiveIndex(index)} aria-label={`Buka hot topic ${index + 1}`}></button>)}
      </div>
    </section>
  );
}

function NewsTicker({ articles = [] }) {
  if (!articles.length) return null;
  return (
    <section className="news-ticker">
      <strong>Update Berita</strong>
      <div>
        <span>{articles.map((item) => item.title).join("   |   ")}</span>
      </div>
      <button onClick={(event) => openArticlePage(articles[0], event)}>Lanjutkan</button>
    </section>
  );
}

function ArticleDetailList({ articles = [] }) {
  return (
    <section className="article-detail-list">
      {articles.map((item) => (
        <article className="article-detail-card" key={item.id}>
          <div className="article-thumb" style={{ backgroundImage: `url(${articleMainImage(item)})` }}></div>
          <span>{item.category}</span>
          <h3>{item.title}</h3>
          <p>{item.content || item.summary}</p>
          <div><strong>{item.author}</strong><time>{item.publishedDate}</time></div>
          <button onClick={(event) => openArticlePage(item, event)}>Lanjutkan</button>
        </article>
      ))}
    </section>
  );
}

function PublicContactSection({ appInfoData = appInfo }) {
  return (
    <section className="public-contact-section">
      <div className="contact-main-info">
        <span className="contact-kicker">Layanan Resmi Daerah</span>
        <h2>Kontak {appInfoData.name || "PETA-LOTIM"}</h2>
        <p>{appInfoData.description || appInfo.description}</p>
        <div className="contact-meta-pills">
          <div className="contact-pill"><Icon name="pin" /><span>Selong, Lombok Timur, NTB</span></div>
          <div className="contact-pill"><Icon name="phone" /><span>(0376) 21xxx &bull; Bidang Aset BPKAD</span></div>
          <div className="contact-pill"><Icon name="mail" /><span>aset@lomboktimurkab.go.id</span></div>
        </div>
      </div>
      <div className="public-contact-card">
        <img src={lombokTimurLogo} alt="Logo Lombok Timur" className="contact-emblem" />
        <span className="agency-label">Pengelola Aset Daerah</span>
        <strong>{appInfoData.maintainer || appInfo.maintainer || "Pemerintah Kabupaten Lombok Timur"}</strong>
        <p>Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD) Bidang Aset.</p>
        <button className="contact-action-btn" onClick={(event) => goToPublicPath("/kontak", event)}>Informasi Lengkap &rarr;</button>
      </div>
    </section>
  );
}

function PublicInfoPage({ articles = [] }) {
  const [category, setCategory] = useState("");
  const filteredArticles = articles.filter((item) => !category || item.category === category);

  return (
    <section className="public-page">
      <div className="public-page-head">
        <span>Informasi Publik</span>
        <h1>Pengumuman, Berita & Artikel</h1>
        <p>Ikuti update pengumuman, berita, dan artikel terbaru dari PETA-LOTIM.</p>
      </div>
      <div className="info-tabs">
        {["", "Pengumuman", "Berita", "Artikel"].map((item) => (
          <button className={category === item ? "active" : ""} key={item || "semua"} onClick={() => setCategory(item)}>{item || "Semua"}</button>
        ))}
      </div>
      <ArticleDetailList articles={filteredArticles} />
      {!filteredArticles.length ? <div className="public-empty">Belum ada informasi pada kategori ini.</div> : null}
    </section>
  );
}

function PublicHome({
  categoriesList = [],
  articles = [],
  appInfoData = appInfo,
  featuredAssets = [],
  onViewDetail = () => {},
}) {
  return (
    <div className="public-home-content">
      {/* 1. Article Hero Slider */}
      <ArticleHeroBanner articles={articles} appInfoData={appInfoData} />

      {/* 2. Breaking News Ticker */}
      <NewsTicker articles={articles} />

      {/* 3. Kategori Aset Daerah */}
      <section className="section-title categories-title">
        <div className="title-with-pill">
          <span className="pill-badge">Klasifikasi</span>
          <h2>Kategori Aset Daerah</h2>
        </div>
        <a href="/jelajah-aset" onClick={(event) => goToPublicPath("/jelajah-aset", event)}>Lihat Semua Aset &rarr;</a>
      </section>
      <section className={`categories category-count-${Math.min(categoriesList.length, 8)}`}>
        {categoriesList.map(([icon, label]) => (
          <a href="/jelajah-aset" onClick={(event) => goToPublicPath("/jelajah-aset", event)} className="category" key={label}>
            <div className="category-icon-box">
              <Icon name={icon} />
            </div>
            <span>{label}</span>
          </a>
        ))}
      </section>

      {/* 4. Aset Unggulan Siap Dimanfaatkan */}
      <section className="section-title">
        <div className="title-with-pill">
          <span className="pill-badge gold">Prioritas</span>
          <h2>Aset Unggulan Siap Dimanfaatkan</h2>
        </div>
        <a href="/aset-unggulan" onClick={(event) => goToPublicPath("/aset-unggulan", event)}>Semua Unggulan &rarr;</a>
      </section>
      <section className="asset-grid public-asset-grid">
        {featuredAssets.slice(0, 4).map((item) => (
          <AssetCard item={item} onViewDetail={onViewDetail} key={item.id || item.title} />
        ))}
      </section>

      {/* 5. Artikel & Berita Terbaru */}
      <section className="section-title article-title">
        <div className="title-with-pill">
          <span className="pill-badge blue">Publikasi</span>
          <h2>Artikel & Berita Terbaru</h2>
        </div>
        <a href="/pengumuman-berita-artikel" onClick={(event) => goToPublicPath("/pengumuman-berita-artikel", event)}>Informasi Lainnya &rarr;</a>
      </section>
      <ArticleDetailList articles={articles} />

      {/* 6. Kontak & Pengelola Terintegrasi */}
      <PublicContactSection appInfoData={appInfoData} />
    </div>
  );
}

function PublicArticleReadPage({ article, articles = [], appInfoData = appInfo }) {
  if (!article) {
    return (
      <section className="public-page">
        <div className="public-empty">Memuat berita atau berita tidak ditemukan.</div>
      </section>
    );
  }
  return (
    <section className="news-read-page">
      <article className="news-read-article">
        <div className="news-read-image" style={{ backgroundImage: `url(${articleMainImage(article)})` }}></div>
        <div className="news-read-body">
          <span>{article.category}</span>
          <h1>{article.title}</h1>
          <div className="article-read-meta"><strong>{article.author}</strong><time>{article.publishedDate}</time></div>
          <p>{article.summary}</p>
          <p>{article.content || article.summary}</p>
          {(article.images || []).length > 1 ? (
            <div className="news-read-gallery">
              {article.images.map((image, index) => <button key={`${image.slice(0, 24)}-${index}`} style={{ backgroundImage: `url(${image})` }} aria-label={`Gambar berita ${index + 1}`}></button>)}
            </div>
          ) : null}
          <p>{appInfoData.description}</p>
          <button className="secondary-admin-button" onClick={(event) => goToPublicPath("/", event)}>Kembali ke Beranda</button>
        </div>
      </article>
      <aside className="news-read-sidebar">
        <h2>Berita Lainnya</h2>
        {articles.filter((item) => item.id !== article.id).slice(0, 4).map((item) => (
          <button key={item.id} onClick={(event) => openArticlePage(item, event)}>
            <span>{item.category}</span>
            <strong>{item.title}</strong>
            <small>{item.publishedDate}</small>
          </button>
        ))}
      </aside>
    </section>
  );
}

function PublicAssetPage({ title, subtitle, assetsList, categoryOptions, locationOptions, schemeOptions, filters, onFilterChange, onViewDetail, showNewest = false }) {
  const filteredAssets = useMemo(() => {
    const rows = showNewest ? [...assetsList].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)) : assetsList;
    return rows.filter((asset) => {
      const text = `${asset.title} ${asset.meta} ${asset.location} ${asset.scheme} ${asset.idPemda} ${asset.address}`.toLowerCase();
      const matchesQuery = !filters.query || text.includes(filters.query.toLowerCase());
      const matchesCategory = !filters.category || asset.meta === filters.category;
      const matchesLocation = !filters.location || asset.location?.toLowerCase().includes(filters.location.toLowerCase()) || asset.district === filters.location;
      const matchesScheme = !filters.scheme || asset.scheme === filters.scheme;
      const matchesStatus = !filters.status || asset.status === filters.status;
      const maxValue = Number(filters.maxValue || 100) >= 100 ? Infinity : Number(filters.maxValue || 0) * 1000000000;
      const matchesValue = maxValue === Infinity || Number(asset.valuePerYear || 0) <= maxValue;
      return matchesQuery && matchesCategory && matchesLocation && matchesScheme && matchesStatus && matchesValue;
    });
  }, [assetsList, filters, showNewest]);

  return (
    <section className="public-page">
      <div className="public-page-head">
        <span>Portal Aset Daerah</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="asset-toolbar">
        <label className="asset-search">
          <Icon name="search" />
          <input value={filters.query} onChange={(event) => onFilterChange({ query: event.target.value })} placeholder="Cari nama aset, Idpemda, lokasi, atau skema..." />
        </label>
        <select value={filters.category} onChange={(event) => onFilterChange({ category: event.target.value })}>
          <option value="">Semua Kategori</option>
          {categoryOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={filters.location} onChange={(event) => onFilterChange({ location: event.target.value })}>
          <option value="">Semua Lokasi</option>
          {locationOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={filters.scheme} onChange={(event) => onFilterChange({ scheme: event.target.value })}>
          <option value="">Semua Skema</option>
          {schemeOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={filters.status} onChange={(event) => onFilterChange({ status: event.target.value })}>
          <option value="">Semua Status</option>
          <option>Tersedia</option>
          <option>Dalam Proses</option>
          <option>Terkontrak</option>
        </select>
      </div>
      <section className="asset-grid public-asset-grid">
        {filteredAssets.map((item) => <AssetCard item={item} onViewDetail={onViewDetail} key={item.id || item.title} />)}
      </section>
      {!filteredAssets.length ? <div className="public-empty">Data aset belum ditemukan.</div> : null}
    </section>
  );
}

function PublicMapPage({ assetsList }) {
  const mappedAssets = assetsList.filter((asset) => asset.lat !== null && asset.lng !== null);
  const [selectedMapAssetId, setSelectedMapAssetId] = useState(mappedAssets[0]?.id || null);
  const selectedMapAsset = mappedAssets.find((asset) => asset.id === selectedMapAssetId) || mappedAssets[0];
  const mapQuery = selectedMapAsset ? `${selectedMapAsset.lat},${selectedMapAsset.lng}` : "Lombok Timur";

  return (
    <section className="public-page">
      <div className="public-page-head">
        <span>Peta Aset</span>
        <h1>Sebaran Aset Kabupaten Lombok Timur</h1>
        <p>Lihat aset yang sudah memiliki titik koordinat dari data backend.</p>
      </div>
      <div className="public-map-card">
        <iframe title="Peta aset Lombok Timur" src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=12&output=embed`} loading="lazy"></iframe>
      </div>
      <div className="public-location-list">
        {mappedAssets.map((asset) => (
          <button key={asset.id} className={asset.id === selectedMapAsset?.id ? "selected" : ""} onClick={() => setSelectedMapAssetId(asset.id)}>
            <Icon name="pin" />
            <div>
              <strong>{asset.title}</strong>
              <span>{asset.address}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function PublicOpportunityPage({ opportunities = [] }) {
  return (
    <section className="public-page">
      <div className="public-page-head">
        <span>Investasi</span>
        <h1>Peluang Investasi Aset Daerah</h1>
        <p>Daftar peluang pemanfaatan aset yang aktif di backend komersialisasi.</p>
      </div>
      <section className="opportunity-grid">
        {opportunities.map((item) => (
          <article className="opportunity-card" key={item.id}>
            <div>
              <span>{item.category}</span>
              <strong>{item.name}</strong>
              <p>{item.asset} - {item.location}</p>
            </div>
            <div className="opportunity-meta">
              <span>{item.status}</span>
              <strong>{item.value}</strong>
            </div>
          </article>
        ))}
      </section>
      {!opportunities.length ? <div className="public-empty">Peluang investasi belum tersedia.</div> : null}
    </section>
  );
}

function SimplePublicPage({ icon, title, text }) {
  return (
    <section className="public-page">
      <div className="simple-public-card">
        <Icon name={icon} />
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}

function PhotoGalleryView({ photos = [], title = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!photos.length) return null;
  const safeIndex = activeIndex < photos.length ? activeIndex : 0;
  const currentPhoto = photos[safeIndex] || photos[0];

  return (
    <div className="asset-gallery-view">
      <div className="asset-gallery-main">
        <img src={currentPhoto} alt={title || "Foto Aset"} />
      </div>
      {photos.length > 1 ? (
        <div className="asset-gallery-thumbs">
          {photos.map((photo, index) => (
            <button
              key={`${index}-${String(photo).slice(0, 20)}`}
              type="button"
              className={`asset-gallery-thumb ${index === safeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Lihat foto ${index + 1}`}
            >
              <img src={photo} alt={`Thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MultiPhotoUploadField({
  label = "Foto Aset",
  hint = "Bisa pilih lebih dari satu foto sekaligus (PNG, JPG, JPEG maks 1,5 MB per foto)",
  photos = [],
  onChange,
  onError,
}) {
  const fileInputRef = useRef(null);

  const handleFiles = (fileList) => {
    const selectedFiles = Array.from(fileList || []);
    if (!selectedFiles.length) return;
    if (selectedFiles.some((file) => !file.type.startsWith("image/"))) {
      if (onError) onError("Semua file yang diupload harus berupa file gambar (JPG/PNG/WEBP)");
      return;
    }
    if (selectedFiles.some((file) => file.size > 1500000)) {
      if (onError) onError("Ukuran masing-masing gambar maksimal 1,5 MB agar data tetap ringan");
      return;
    }
    if (onError) onError("");

    Promise.all(
      selectedFiles.map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }))
    )
      .then((newPhotos) => {
        const combined = [...photos, ...newPhotos];
        onChange(combined);
      })
      .catch(() => {
        if (onError) onError("Gagal membaca file foto");
      });
  };

  const handleRemove = (indexToRemove) => {
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="wide photo-upload-block">
      <div className="photo-upload-header">
        <div className="photo-upload-info">
          <span className="photo-upload-label">{label}</span>
          <span className="photo-upload-count">{photos.length} foto</span>
        </div>
        <button
          type="button"
          className="photo-upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          + Tambah Foto
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      <div className="photo-upload-hint">{hint}</div>

      {photos.length > 0 ? (
        <div className="photo-gallery-grid">
          {photos.map((photo, index) => (
            <div key={`${index}-${String(photo).slice(0, 20)}`} className="photo-gallery-item">
              <img src={photo} alt={`Foto ${index + 1}`} />
              {index === 0 ? <span className="photo-badge-main">Utama</span> : null}
              <button
                type="button"
                className="photo-remove-btn"
                onClick={() => handleRemove(index)}
                title="Hapus foto ini"
                aria-label="Hapus foto"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="photo-upload-empty-box"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="photo-upload-empty-icon">📷</span>
          <span className="photo-upload-empty-text">Klik untuk memilih satu atau beberapa foto</span>
          <span className="photo-upload-empty-subtext">Mendukung multi-select foto (maks. 1,5 MB per foto)</span>
        </div>
      )}
    </div>
  );
}

function AssetDetailModal({ asset, onClose }) {
  if (!asset) return null;
  const mapUrl = asset.lat !== null && asset.lng !== null ? `https://www.google.com/maps?q=${asset.lat},${asset.lng}` : "";
  const photos = Array.isArray(asset.photos) && asset.photos.length ? asset.photos : (asset.imageUrl ? [asset.imageUrl] : (asset.photoUrl ? [asset.photoUrl] : []));

  return (
    <div className="modal-backdrop">
      <article className="location-modal asset-detail-modal">
        <div className="modal-head">
          <div>
            <span>Detail Aset</span>
            <h2>{asset.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Tutup">×</button>
        </div>
        <div className="modal-body">
          {photos.length > 0 ? (
            <PhotoGalleryView photos={photos} title={asset.title} />
          ) : (
            <div className="asset-detail-photo" style={asset.imageUrl ? { backgroundImage: `url(${asset.imageUrl})` } : { backgroundImage: `url(${assetSprite})`, backgroundPosition: asset.pos }} />
          )}
          <div className="detail-grid">
            <div><span>Idpemda</span><strong>{asset.idPemda || "-"}</strong></div>
            <div><span>Kategori</span><strong>{asset.meta || "-"}</strong></div>
            <div><span>Status</span><strong>{asset.status || "-"}</strong></div>
            <div><span>Skema</span><strong>{asset.scheme || "-"}</strong></div>
            <div><span>Luas</span><strong>{asset.area || "-"}</strong></div>
            <div><span>Estimasi Nilai</span><strong>{asset.value || "-"}</strong></div>
            <div className="wide"><span>Potensi</span><strong>{asset.potential || asset.potensi || "-"}</strong></div>
            <div className="wide"><span>Lokasi</span><strong>{asset.location || "-"}</strong></div>
            <div className="wide"><span>Alamat Lengkap</span><strong>{asset.address || asset.location || "-"}</strong></div>
            <div><span>Latitude</span><strong>{asset.lat ?? "-"}</strong></div>
            <div><span>Longitude</span><strong>{asset.lng ?? "-"}</strong></div>
          </div>
        </div>
        <div className="modal-actions">
          {mapUrl ? <a className="map-link-button" href={mapUrl} target="_blank" rel="noreferrer">Buka di Google Maps</a> : null}
          <button onClick={onClose}>Tutup</button>
        </div>
      </article>
    </div>
  );
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const publicData = usePublicHomeData();
  const [publicFilters, setPublicFilters] = useState({ query: "", category: "", location: "", scheme: "", status: "", maxValue: 100 });
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  if (path.startsWith("/login")) {
    return <LoginPage />;
  }

  if (path.startsWith("/admin")) {
    return <AdminDashboard />;
  }

  const featuredAssets = publicData?.featuredAssets?.length ? publicData.featuredAssets : assets;
  const allPublicAssets = publicData?.assets?.length ? publicData.assets : featuredAssets;
  const newPublicAssets = publicData?.newAssets?.length ? publicData.newAssets : [...allPublicAssets].sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  const publicCategories = publicData?.categories?.length
    ? publicData.categories.map((item, index) => [getCategoryIcon(item.name, index), item.name])
    : categories;
  const categoryOptions = publicCategories.map(([, label]) => label);
  const locationOptions = publicData?.locations || [];
  const schemeOptions = publicData?.schemes || [];
  const publicStats = publicData?.stats || stats.map(([icon, label, value, tone]) => ({ icon, label, value, tone }));
  const publicAppInfo = publicData?.appInfo || appInfo;
  const publicArticles = publicData?.articles || [];
  const articleIdMatch = path.match(/^\/baca-berita\/(\d+)/);
  const selectedPublicArticle = articleIdMatch ? publicArticles.find((item) => item.id === Number(articleIdMatch[1])) : null;
  const updatePublicFilters = (patch) => setPublicFilters((current) => ({ ...current, ...patch }));
  const openAssetSearch = () => goToPublicPath("/jelajah-aset");
  const resetPublicFilters = () => {
    setPublicFilters({ query: "", category: "", location: "", scheme: "", status: "", maxValue: 100 });
    goToPublicPath("/jelajah-aset");
  };
  const pageContent = {
    "/": (
      <PublicHome
        categoriesList={publicCategories}
        articles={publicArticles}
        appInfoData={publicAppInfo}
        featuredAssets={featuredAssets}
        onViewDetail={setSelectedAsset}
      />
    ),
    "/jelajah-aset": <PublicAssetPage title="Aset Dimanfaatkan" subtitle="Temukan seluruh daftar aset yang dimanfaatkan berdasarkan data backend." assetsList={allPublicAssets} categoryOptions={categoryOptions} locationOptions={locationOptions} schemeOptions={schemeOptions} filters={publicFilters} onFilterChange={updatePublicFilters} onViewDetail={setSelectedAsset} />,
    "/aset-unggulan": <PublicAssetPage title="Aset Unggulan" subtitle="Kumpulan aset prioritas yang siap dikomersialisasikan dan dipromosikan kepada calon mitra." assetsList={featuredAssets} categoryOptions={categoryOptions} locationOptions={locationOptions} schemeOptions={schemeOptions} filters={publicFilters} onFilterChange={updatePublicFilters} onViewDetail={setSelectedAsset} />,
    "/aset-baru": <PublicAssetPage title="Aset Baru" subtitle="Aset terbaru yang masuk ke daftar pemanfaatan aset daerah." assetsList={newPublicAssets} categoryOptions={categoryOptions} locationOptions={locationOptions} schemeOptions={schemeOptions} filters={publicFilters} onFilterChange={updatePublicFilters} onViewDetail={setSelectedAsset} showNewest />,
    "/peta-aset": <PublicMapPage assetsList={allPublicAssets} />,
    "/peluang-investasi": <PublicOpportunityPage opportunities={publicData?.opportunities || []} />,
    "/panduan-regulasi": <PublicInfoPage articles={publicArticles} />,
    "/pengumuman-berita-artikel": <PublicInfoPage articles={publicArticles} />,
    "/tentang-kami": <SimplePublicPage icon="info" title={`Tentang ${publicAppInfo.name || "Portal"}`} text={publicAppInfo.description || appInfo.description} />,
    "/kontak": <SimplePublicPage icon="user" title="Kontak" text={`${publicAppInfo.description || appInfo.description} Pengelola: ${publicAppInfo.maintainer || appInfo.maintainer}.`} />,
  }[path] || (articleIdMatch ? <PublicArticleReadPage article={selectedPublicArticle} articles={publicArticles} appInfoData={publicAppInfo} /> : null);

  return (
    <div className="app-shell">
      <Header path={path} filters={publicFilters} onFilterChange={updatePublicFilters} onOpenAssetSearch={openAssetSearch} appInfoData={publicAppInfo} />
      <div className="layout">
        <Sidebar path={path} />
        <main className="content">
          {pageContent || (
            <PublicHome
              categoriesList={publicCategories}
              articles={publicArticles}
              appInfoData={publicAppInfo}
              featuredAssets={featuredAssets}
              onViewDetail={setSelectedAsset}
            />
          )}
        </main>
        <Filters
          categoryOptions={categoryOptions}
          locationOptions={locationOptions}
          schemeOptions={schemeOptions}
          statItems={publicStats}
          filters={publicFilters}
          onFilterChange={updatePublicFilters}
          onApplyFilters={openAssetSearch}
          onResetFilters={resetPublicFilters}
        />
      </div>
      <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </div>
  );
}

const permissionOptions = [
  "Lihat Dashboard",
  "Kelola Aset",
  "Kelola Kategori",
  "Kelola Lokasi",
  "Kelola Skema",
  "Kelola Pengguna",
  "Kelola Role",
  "Kelola Komersialisasi",
  "Kelola Keuangan",
  "Kelola Monitoring",
  "Verifikasi Pengajuan",
  "Laporan",
];

const appInfo = {
  name: "PETA-LOTIM",
  shortName: "PETA-LOTIM",
  description: "Portal Elektronik Lombok Timur untuk mengelola data aset, lokasi, komersialisasi, penilaian, keuangan, monitoring, dan statistik aset daerah.",
  copyright: "© 2024 Portal Kabupaten Lombok Timur. All rights reserved.",
  version: "1.0.0",
  maintainer: "Pemerintah Kabupaten Lombok Timur",
  logoUrl: "",
};

const routePermissions = {
  "/admin": "Lihat Dashboard",
  "/admin/aset": "Kelola Aset",
  "/admin/kategori": "Kelola Kategori",
  "/admin/lokasi": "Kelola Lokasi",
  "/admin/skema": "Kelola Skema",
  "/admin/pengguna": "Kelola Pengguna",
  "/admin/role": "Kelola Role",
  "/admin/peluang-aset": "Kelola Komersialisasi",
  "/admin/pengajuan-pemanfaatan": "Kelola Komersialisasi",
  "/admin/kerja-sama": "Kelola Komersialisasi",
  "/admin/kontrak": "Kelola Komersialisasi",
  "/admin/pembayaran": "Kelola Komersialisasi",
  "/admin/penilaian-aset": "Kelola Keuangan",
  "/admin/nilai-potensi": "Kelola Keuangan",
  "/admin/pendapatan-pad": "Kelola Keuangan",
  "/admin/laporan-keuangan": "Kelola Keuangan",
  "/admin/monitoring-aset": "Kelola Monitoring",
  "/admin/laporan": "Kelola Monitoring",
  "/admin/laporan-statistik": "Kelola Monitoring",
  "/admin/artikel-berita": "Lihat Dashboard",
  "/admin/tentang-aplikasi": "Lihat Dashboard",
};

const adminMenu = [
  ["Dashboard", [["home", "Dashboard", "/admin", "Lihat Dashboard"]]],
  ["Master Data", [["box", "Data Aset", "/admin/aset", "Kelola Aset"], ["folder", "Kategori Aset", "/admin/kategori", "Kelola Kategori"], ["pin", "Lokasi", "/admin/lokasi", "Kelola Lokasi"], ["doc", "Skema Pemanfaatan", "/admin/skema", "Kelola Skema"], ["user", "Pengguna", "/admin/pengguna", "Kelola Pengguna"], ["lock", "Role & Hak Akses", "/admin/role", "Kelola Role"]]],
  ["Komersialisasi", [["chart", "Peluang Aset", "/admin/peluang-aset", "Kelola Komersialisasi"], ["doc", "Pengajuan Pemanfaatan", "/admin/pengajuan-pemanfaatan", "Kelola Komersialisasi"], ["handshake", "Kerja Sama", "/admin/kerja-sama", "Kelola Komersialisasi"], ["folder", "Kontrak", "/admin/kontrak", "Kelola Komersialisasi"], ["money", "Pembayaran & Setoran", "/admin/pembayaran", "Kelola Komersialisasi"]]],
  ["Penilaian & Keuangan", [["calculator", "Penilaian Aset", "/admin/penilaian-aset", "Kelola Keuangan"], ["growth", "Nilai Potensi", "/admin/nilai-potensi", "Kelola Keuangan"], ["receipt", "Pendapatan (PAD)", "/admin/pendapatan-pad", "Kelola Keuangan"], ["doc", "Laporan Keuangan", "/admin/laporan-keuangan", "Kelola Keuangan"]]],
  ["Monitoring & Laporan", [["monitor", "Monitoring Aset", "/admin/monitoring-aset", "Kelola Monitoring"], ["doc", "Laporan", "/admin/laporan", "Kelola Monitoring"], ["chart", "Statistik", "/admin/laporan-statistik", "Kelola Monitoring"]]],
  ["Informasi Publik", [["doc", "Pengumuman, Berita & Artikel", "/admin/artikel-berita", "Lihat Dashboard"]]],
  ["Pengaturan", [["info", "Tentang Aplikasi", "/admin/tentang-aplikasi", "Lihat Dashboard"]]],
];

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("peta_admin_user") || "null");
  } catch {
    return null;
  }
}

function canAccess(permission) {
  if (!permission) return true;
  const permissions = getSessionUser()?.permissions || [];
  return permissions.includes(permission);
}

function useDashboardData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/dashboard")
      .then((response) => {
        if (!response.ok) throw new Error("API dashboard belum tersedia");
        return response.json();
      })
      .then((payload) => alive && setData(payload))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, []);

  return { data, error };
}

function useLocationsData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/locations")
      .then((response) => {
        if (!response.ok) throw new Error("API lokasi belum tersedia");
        return response.json();
      })
      .then((payload) => alive && setData(payload))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, []);

  return { data, error };
}

function useAssetsData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/assets")
      .then((response) => {
        if (!response.ok) throw new Error("API data aset belum tersedia");
        return response.json();
      })
      .then((payload) => alive && setData(payload))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, []);

  return { data, error };
}

function useCategoriesData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/categories")
      .then((response) => {
        if (!response.ok) throw new Error("API kategori aset belum tersedia");
        return response.json();
      })
      .then((payload) => alive && setData(payload))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, []);

  return { data, error };
}

function useMasterData(kind) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/${kind}`)
      .then((response) => {
        if (!response.ok) throw new Error(`API ${kind} belum tersedia`);
        return response.json();
      })
      .then((payload) => alive && setData(payload))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, [kind]);

  return { data, error };
}

function useStatisticsData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/statistics-dashboard")
      .then((response) => {
        if (!response.ok) throw new Error("API statistik belum tersedia");
        return response.json();
      })
      .then((payload) => alive && setData(payload))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, []);

  return { data, error };
}

function useUtilizationReportData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/utilization-report")
      .then((response) => {
        if (!response.ok) throw new Error("API laporan belum tersedia");
        return response.json();
      })
      .then((payload) => alive && setData(payload))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, []);

  return { data, error };
}

function AdminSidebar() {
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/admin";
  const permissions = getSessionUser()?.permissions || [];
  const [sidebarInfo, setSidebarInfo] = useState(appInfo);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/app-info")
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (alive && payload?.appInfo) setSidebarInfo(payload.appInfo);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <aside className="admin-sidebar">
      <a className="admin-logo" href="/" title="Buka Portal Kabupaten Lombok Timur">
        <img className="admin-logo-image" src={sidebarInfo.logoUrl || lombokTimurLogo} alt="Logo Kabupaten Lombok Timur" />
        <div>
          <strong>{sidebarInfo.shortName || sidebarInfo.name}</strong>
          <span>{brandSubtitle(sidebarInfo).replace(" Lombok Timur", "")}<br />Lombok Timur</span>
        </div>
      </a>

      <nav>
        {adminMenu.map(([group, links]) => {
          const visibleLinks = links.filter(([, , href, permission]) => href === "#" || permissions.includes(permission));
          if (!visibleLinks.length) return null;
          return (
          <div className="admin-menu-group" key={group}>
            {group !== "Dashboard" && <p>{group}</p>}
            {visibleLinks.map(([icon, label, href], index) => (
              <a className={href !== "#" && currentPath === href ? "current" : ""} href={href} key={label}>
                <Icon name={icon} />
                <span>{label}</span>
                {index === 0 && group === "Master Data" ? <Icon name="chevron" /> : null}
              </a>
            ))}
          </div>
        );
        })}
      </nav>

      <a className="admin-settings" href="/admin/role">
        <Icon name="settings" />
        <span>Pengaturan Sistem</span>
        <Icon name="chevron" />
      </a>
    </aside>
  );
}

function AdminTopbar({ user, title = "Dashboard Admin", breadcrumb = "" }) {
  const logout = () => {
    localStorage.removeItem("peta_admin_session");
    window.location.href = "/login";
  };

  return (
    <header className="admin-topbar">
      <button className="admin-menu-button" aria-label="Menu"><Icon name="menu" /></button>
      <div className="admin-title">
        <h1>{title}</h1>
        {breadcrumb ? <span>{breadcrumb}</span> : null}
      </div>
      <div className="admin-account">
        <button className="admin-bell" aria-label="Notifikasi">
          <Icon name="bell" />
          <span>{user?.notifications ?? 0}</span>
        </button>
        <button className="admin-help" aria-label="Bantuan"><Icon name="help" /></button>
        <div className="avatar">AD</div>
        <div>
          <strong>{user?.name ?? "Admin"}</strong>
          <small>{user?.role ?? "Super Admin"}</small>
        </div>
        <Icon name="chevron" />
      </div>
      <button className="logout-button" onClick={logout}>Keluar</button>
    </header>
  );
}

function AdminFooter({ info = appInfo }) {
  return (
    <footer className="admin-footer">
      <span>{info.copyright}</span>
      <span>Versi {info.version}</span>
    </footer>
  );
}

function SummaryCard({ card }) {
  return (
    <article className="summary-card">
      <div>
        <span>{card.label}</span>
        <strong>{card.value}</strong>
        <small>{card.helper}</small>
      </div>
      <div className={`summary-icon ${card.tone}`}>
        <Icon name={card.icon} />
      </div>
      <a href={card.href || "#"}>Lihat Detail <span>{"->"}</span></a>
    </article>
  );
}

function PadChart({ rows }) {
  const width = 620;
  const height = 250;
  const padding = 42;
  const max = 200;
  const pointsFor = (key) => rows.map((row, index) => {
    const x = padding + (index * (width - padding * 1.4)) / (rows.length - 1);
    const y = height - padding - (row[key] / max) * (height - padding * 1.45);
    return `${x},${y}`;
  }).join(" ");
  const potentialPoints = pointsFor("potential");
  const realizationPoints = pointsFor("realization");

  return (
    <section className="admin-card chart-card">
      <div className="admin-card-head">
        <h2>Grafik Potensi vs Realisasi PAD</h2>
        <div className="chart-legend"><span className="blue-dot"></span>Potensi PAD <span className="green-dot"></span>Realisasi PAD</div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" role="img" aria-label="Grafik potensi dan realisasi PAD">
        {[0, 50, 100, 150, 200].map((value) => {
          const y = height - padding - (value / max) * (height - padding * 1.45);
          return (
            <g key={value}>
              <line x1={padding} x2={width - 18} y1={y} y2={y} />
              <text x="6" y={y + 4}>{value === 0 ? "0" : `${value} M`}</text>
            </g>
          );
        })}
        {rows.map((row, index) => {
          const x = padding + (index * (width - padding * 1.4)) / (rows.length - 1);
          return (
            <g key={row.month}>
              <line className="vertical" x1={x} x2={x} y1={22} y2={height - padding} />
              <text className="month" x={x - 9} y={height - 8}>{row.month}</text>
            </g>
          );
        })}
        <polygon points={`${padding},${height - padding} ${potentialPoints} ${width - 18},${height - padding}`} className="area blue-area" />
        <polygon points={`${padding},${height - padding} ${realizationPoints} ${width - 18},${height - padding}`} className="area green-area" />
        <polyline points={potentialPoints} className="line blue-line" />
        <polyline points={realizationPoints} className="line green-line" />
        {rows.map((row, index) => {
          const x = padding + (index * (width - padding * 1.4)) / (rows.length - 1);
          const y1 = height - padding - (row.potential / max) * (height - padding * 1.45);
          const y2 = height - padding - (row.realization / max) * (height - padding * 1.45);
          return (
            <g key={`${row.month}-dots`}>
              <circle cx={x} cy={y1} r="4" className="blue-point" />
              <circle cx={x} cy={y2} r="4" className="green-point" />
            </g>
          );
        })}
      </svg>
    </section>
  );
}

function DonutChart({ categories }) {
  const gradient = useMemo(() => {
    let cursor = 0;
    return categories.map((item) => {
      const part = `${item.color} ${cursor}% ${cursor + item.percent}%`;
      cursor += item.percent;
      return part;
    }).join(", ");
  }, [categories]);

  return (
    <section className="admin-card donut-card">
      <h2>Aset Berdasarkan Kategori</h2>
      <div className="donut-wrap">
        <div className="donut" style={{ background: `conic-gradient(${gradient})` }}>
          <div><span>Total</span><strong>1.248</strong><span>Aset</span></div>
        </div>
        <div className="donut-legend">
          {categories.map((item) => (
            <div key={item.label}>
              <span style={{ background: item.color }}></span>
              <strong>{item.label}</strong>
              <em>{item.percent}% ({item.count})</em>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Activities({ rows }) {
  return (
    <section className="admin-card activity-card">
      <div className="admin-card-head">
        <h2>Aktivitas Terbaru</h2>
        <a href="/admin/monitoring-aset">Lihat Semua</a>
      </div>
      {rows.map((row) => (
        <div className="activity-row" key={row.id}>
          <div className={`activity-icon ${row.tone}`}><Icon name={row.icon} /></div>
          <div>
            <strong>{row.title}</strong>
            <span>{row.detail}</span>
          </div>
          <time>{row.time}</time>
        </div>
      ))}
    </section>
  );
}

function SubmissionsTable({ rows }) {
  return (
    <section className="admin-card submissions-card">
      <div className="admin-card-head">
        <h2>Pengajuan Pemanfaatan Terbaru</h2>
        <a href="/admin/pengajuan-pemanfaatan">Lihat Semua</a>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Aset</th>
              <th>Pemohon</th>
              <th>Skema</th>
              <th>Tanggal Pengajuan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.asset}</td>
                <td>{row.applicant}</td>
                <td>{row.scheme}</td>
                <td>{row.date}</td>
                <td><span className={`status-pill ${row.status.toLowerCase().replaceAll(" ", "-")}`}>{row.status}</span></td>
                <td><button className="table-action" aria-label={`Lihat ${row.asset}`}><Icon name="eye" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Menampilkan 1 - 5 dari 37 data</span>
        <div><button><Icon name="chevron" /></button><button className="active">1</button><button>2</button><button>3</button><span>...</span><button>8</button><button><Icon name="chevron" /></button></div>
      </div>
    </section>
  );
}

function StatusAndDocs({ statuses, documents }) {
  return (
    <div className="admin-stack">
      <section className="admin-card status-card">
        <div className="admin-card-head">
          <h2>Aset Berdasarkan Status</h2>
          <a href="/admin/aset">Lihat Detail</a>
        </div>
        {statuses.map((item) => (
          <div className="status-bar-row" key={item.label}>
            <div><strong>{item.label}</strong><span>{item.value} ({item.percent}%)</span></div>
            <div className="status-track"><span style={{ width: `${item.percent * 2.5}%`, background: item.color }}></span></div>
          </div>
        ))}
      </section>
      <section className="admin-card docs-card">
        <div className="admin-card-head">
          <h2>Dokumen Penting</h2>
          <a href="/admin/laporan-keuangan">Lihat Semua</a>
        </div>
        {documents.map((doc) => (
          <div className="doc-row" key={doc.id}>
            <div className="pdf-icon">PDF</div>
            <div><strong>{doc.title}</strong><span>{doc.type}</span></div>
            <button aria-label={`Unduh ${doc.title}`}><Icon name="download" /></button>
          </div>
        ))}
      </section>
    </div>
  );
}

function ModuleOverview({ groups }) {
  return (
    <section className="module-overview">
      {groups.map((group) => (
        <article className="admin-card module-card" key={group.group}>
          <div className="module-card-head">
            <div className={`summary-icon ${group.tone}`}><Icon name={group.icon} /></div>
            <div>
              <h2>{group.group}</h2>
              <a href={group.href}>Buka Modul</a>
            </div>
          </div>
          <div className="module-links">
            {group.items.map((item) => (
              <a href={item.href} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </a>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function AdminDashboard() {
  const isLoggedIn = localStorage.getItem("peta_admin_session") === "demo-admin-session";
  const path = window.location.pathname.replace(/\/$/, "");

  if (!isLoggedIn) {
    return <LoginPage message="Silakan masuk untuk membuka Dashboard Admin." />;
  }

  const neededPermission = routePermissions[path || "/admin"];
  if (!canAccess(neededPermission)) {
    return <AccessDeniedPage permission={neededPermission} />;
  }

  if (path === "/admin/lokasi") {
    return <LocationsPage />;
  }

  if (path === "/admin/aset") {
    return <AssetsPage />;
  }

  if (path === "/admin/kategori") {
    return <CategoriesPage />;
  }

  if (path === "/admin/skema") {
    return <MasterCrudPage config={masterConfigs.schemes} />;
  }

  if (path === "/admin/pengguna") {
    return <MasterCrudPage config={masterConfigs.users} />;
  }

  if (path === "/admin/role") {
    return <MasterCrudPage config={masterConfigs.roles} />;
  }

  if (path === "/admin/peluang-aset") {
    return <MasterCrudPage config={masterConfigs.opportunities} />;
  }

  if (path === "/admin/pengajuan-pemanfaatan") {
    return <MasterCrudPage config={masterConfigs.utilizationSubmissions} />;
  }

  if (path === "/admin/kerja-sama") {
    return <MasterCrudPage config={masterConfigs.partnerships} />;
  }

  if (path === "/admin/kontrak") {
    return <MasterCrudPage config={masterConfigs.contracts} />;
  }

  if (path === "/admin/pembayaran") {
    return <MasterCrudPage config={masterConfigs.payments} />;
  }

  if (path === "/admin/penilaian-aset") {
    return <MasterCrudPage config={masterConfigs.assetAppraisals} />;
  }

  if (path === "/admin/nilai-potensi") {
    return <MasterCrudPage config={masterConfigs.potentialValues} />;
  }

  if (path === "/admin/pendapatan-pad") {
    return <MasterCrudPage config={masterConfigs.padRevenues} />;
  }

  if (path === "/admin/laporan-keuangan") {
    return <UtilizationReportPage />;
  }

  if (path === "/admin/monitoring-aset") {
    return <MasterCrudPage config={masterConfigs.assetMonitorings} />;
  }

  if (path === "/admin/laporan") {
    return <UtilizationReportPage />;
  }

  if (path === "/admin/laporan-statistik") {
    return <StatisticsPage />;
  }

  if (path === "/admin/artikel-berita") {
    return <MasterCrudPage config={masterConfigs.articles} />;
  }

  if (path === "/admin/tentang-aplikasi") {
    return <BackendAboutPage />;
  }

  return <DashboardHome />;
}

function BackendAboutPage() {
  const [form, setForm] = useState(appInfo);
  const [user, setUser] = useState(getSessionUser());
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/app-info")
      .then((response) => {
        if (!response.ok) throw new Error("Gagal memuat info aplikasi");
        return response.json();
      })
      .then((payload) => {
        if (!alive) return;
        setForm(payload.appInfo || appInfo);
        setUser(payload.user || getSessionUser());
      })
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, []);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus("");
  };

  const updateLogo = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Logo harus berupa file gambar");
      return;
    }
    if (file.size > 900000) {
      setError("Ukuran logo maksimal 900 KB agar data lokal tetap ringan");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateField("logoUrl", reader.result);
      setError("");
    };
    reader.onerror = () => setError("Gagal membaca file logo");
    reader.readAsDataURL(file);
  };

  const saveInfo = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const response = await fetch("/api/admin/app-info", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Gagal menyimpan info aplikasi");
      setForm(payload.appInfo || form);
      setStatus("Info aplikasi berhasil disimpan.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <AdminTopbar user={user} title="Tentang Aplikasi" breadcrumb="Dashboard > Pengaturan > Tentang Aplikasi" />
        <div className="admin-content locations-content">
          {status ? <div className="login-info">{status}</div> : null}
          {error ? <div className="login-error">{error}</div> : null}
          <section className="about-app-hero">
            <img src={form.logoUrl || lombokTimurLogo} alt="Logo Kabupaten Lombok Timur" />
            <div>
              <span>{form.shortName}</span>
              <h2>{form.name}</h2>
              <p>{form.description}</p>
            </div>
          </section>
          <form className="admin-card about-app-form" onSubmit={saveInfo}>
            <div className="admin-card-head">
              <h2>Edit Informasi Aplikasi</h2>
              <button className="primary-admin-button" type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</button>
            </div>
            <div className="modal-grid">
              <label>Nama Aplikasi<input value={form.name} onChange={(event) => updateField("name", event.target.value)} /></label>
              <label>Nama Singkat<input value={form.shortName} onChange={(event) => updateField("shortName", event.target.value)} /></label>
              <label>Versi<input value={form.version} onChange={(event) => updateField("version", event.target.value)} /></label>
              <label>Pengelola<input value={form.maintainer} onChange={(event) => updateField("maintainer", event.target.value)} /></label>
              <label className="wide">Deskripsi<textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} /></label>
              <label className="wide">Teks Footer / Copyright<input value={form.copyright} onChange={(event) => updateField("copyright", event.target.value)} /></label>
              <label className="wide">
                Upload Logo
                <div className="logo-upload-field">
                  <img src={form.logoUrl || lombokTimurLogo} alt="Preview logo" />
                  <div>
                    <input type="file" accept="image/*" onChange={(event) => updateLogo(event.target.files?.[0])} />
                    <span>Format gambar, maksimal 900 KB.</span>
                    {form.logoUrl ? <button type="button" className="secondary-admin-button" onClick={() => updateField("logoUrl", "")}>Gunakan Logo Default</button> : null}
                  </div>
                </div>
              </label>
            </div>
          </form>
          <section className="about-app-grid">
            <article>
              <Icon name="info" />
              <span>Nama Aplikasi</span>
              <strong>{form.name}</strong>
            </article>
            <article>
              <Icon name="settings" />
              <span>Versi</span>
              <strong>{form.version}</strong>
            </article>
            <article>
              <Icon name="office" />
              <span>Pengelola</span>
              <strong>{form.maintainer}</strong>
            </article>
            <article>
              <Icon name="doc" />
              <span>Teks Footer</span>
              <strong>{form.copyright}</strong>
            </article>
          </section>
          <section className="admin-card about-app-note">
            <h2>Lokasi Mengubah Tulisan Footer</h2>
            <p>Sekarang tulisan footer bisa diganti langsung dari form ini. Perubahan disimpan ke backend dan dipakai di Dashboard Admin.</p>
          </section>
          <section className="admin-card about-footer-preview">
            <h2>Preview Footer</h2>
            <AdminFooter info={form} />
          </section>
          <section className="admin-card about-footer-preview">
            <h2>Preview Brand</h2>
            <BrandBlock info={form} />
          </section>
        </div>
      </main>
    </div>
  );
}

function DashboardHome() {
  const { data, error } = useDashboardData();

  if (error) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminTopbar />
          <div className="admin-state">Backend belum merespons: {error}</div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminTopbar />
          <div className="admin-state">Memuat data dashboard...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <AdminTopbar user={data.user} />
        <div className="admin-content">
          <section className="summary-grid">
            {data.summaryCards.map((card) => <SummaryCard card={card} key={card.id} />)}
          </section>
          <ModuleOverview groups={data.moduleOverview || []} />
          <section className="admin-grid top-grid">
            <PadChart rows={data.monthlyPad} />
            <DonutChart categories={data.categoryBreakdown} />
            <Activities rows={data.activities} />
          </section>
          <section className="admin-grid bottom-grid">
            <SubmissionsTable rows={data.submissions} />
            <StatusAndDocs statuses={data.statusBreakdown} documents={data.documents} />
          </section>
          <AdminFooter info={data.appInfo || appInfo} />
        </div>
      </main>
    </div>
  );
}

function AccessDeniedPage({ permission }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <AdminTopbar user={getSessionUser()} title="Akses Ditolak" breadcrumb="Dashboard > Hak Akses" />
        <div className="admin-content">
          <section className="admin-card access-denied-card">
            <div className="summary-icon pink"><Icon name="lock" /></div>
            <h2>Anda tidak memiliki hak akses</h2>
            <p>Halaman ini membutuhkan permission <strong>{permission}</strong>. Hubungi Super Admin untuk mengubah role atau hak akses akun Anda.</p>
            <a className="primary-admin-button" href="/admin">Kembali ke Dashboard</a>
          </section>
        </div>
      </main>
    </div>
  );
}

function LocationSummaryCard({ card }) {
  return (
    <article className="summary-card location-summary-card">
      <div>
        <span>{card.label}</span>
        <strong>{card.value}</strong>
        <small>{card.helper}</small>
      </div>
      <div className={`summary-icon ${card.tone}`}>
        <Icon name={card.icon} />
      </div>
    </article>
  );
}

function LocationMap({ districts, selectedLocation }) {
  const mapRef = React.useRef(null);
  const [mapStatus, setMapStatus] = useState("loading");
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const locations = useMemo(
    () => districts.filter((item) => typeof item.lat === "number" && typeof item.lng === "number"),
    [districts]
  );

  useEffect(() => {
    if (!apiKey) {
      setMapStatus("fallback");
      return;
    }

    let alive = true;
    const scriptId = "google-maps-script";

    const bootMap = () => {
      if (!alive || !mapRef.current || !window.google?.maps) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: selectedLocation?.lat && selectedLocation?.lng ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : { lat: -8.58, lng: 116.55 },
        zoom: selectedLocation ? 15 : 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      const bounds = new window.google.maps.LatLngBounds();
      const infoWindow = new window.google.maps.InfoWindow();

      locations.forEach((location) => {
        const position = { lat: location.lat, lng: location.lng };
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: location.name,
          label: {
            text: String(location.assetCount),
            color: "#ffffff",
            fontWeight: "800",
          },
        });

        marker.addListener("click", () => {
          infoWindow.setContent(`
            <div style="font-family:Inter,Arial,sans-serif;min-width:190px">
              <strong>${location.name}</strong>
              <div>${location.district}</div>
              <div>${location.idPemda || ""}</div>
            </div>
          `);
          infoWindow.open({ map, anchor: marker });
        });

        bounds.extend(position);
        if (selectedLocation?.id === location.id) {
          map.setCenter(position);
          map.setZoom(16);
          infoWindow.setContent(`
            <div style="font-family:Inter,Arial,sans-serif;min-width:190px">
              <strong>${location.name}</strong>
              <div>${location.district}</div>
              <div>${location.idPemda || ""}</div>
            </div>
          `);
          infoWindow.open({ map, anchor: marker });
        }
      });

      if (locations.length && !selectedLocation) map.fitBounds(bounds, 42);
      setMapStatus("ready");
    };

    if (window.google?.maps) {
      bootMap();
      return () => {
        alive = false;
      };
    }

    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => alive && setMapStatus("error");
      document.head.appendChild(script);
    }

    script.addEventListener("load", bootMap, { once: true });

    return () => {
      alive = false;
      script?.removeEventListener("load", bootMap);
    };
  }, [apiKey, locations, selectedLocation]);

  return (
    <section className="admin-card location-map-card">
      <div className="admin-card-head">
        <h2>Peta Lokasi Aset</h2>
        <a href="https://www.google.com/maps/@-8.58,116.55,10z" target="_blank" rel="noreferrer">Buka Peta</a>
      </div>
      <div className="location-map">
        {mapStatus === "fallback" ? (
          <iframe
            className="google-map"
            title="Peta Lombok"
            loading="lazy"
            src={selectedLocation?.lat && selectedLocation?.lng
              ? `https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&t=k&z=16&ie=UTF8&iwloc=&output=embed`
              : "https://maps.google.com/maps?q=Lombok%2C%20Nusa%20Tenggara%20Barat&t=k&z=10&ie=UTF8&iwloc=&output=embed"}
          ></iframe>
        ) : (
          <div ref={mapRef} className="google-map"></div>
        )}
        {mapStatus === "error" ? (
          <div className="map-config-message">
            <strong>Google Maps gagal dimuat.</strong>
            <span>Periksa API key, billing, dan pembatasan domain.</span>
          </div>
        ) : null}
        <div className="map-legend">
          <strong>Legenda</strong>
          <span><i className="legend-dot"></i> Marker jumlah aset</span>
          <span><Icon name="flag" /> Lokasi Strategis</span>
        </div>
      </div>
    </section>
  );
}

function DistrictTable({ rows }) {
  return (
    <section className="admin-card district-card">
      <div className="admin-card-head">
        <h2>Sebaran Lokasi per Kecamatan</h2>
        <a href="#">Lihat Detail</a>
      </div>
      <div className="table-wrap">
        <table className="district-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kecamatan</th>
              <th>Lokasi</th>
              <th>Lokasi dengan Aset</th>
              <th>Aset Belum Dimanfaatkan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.district}</td>
                <td>{row.location || row.address || row.total}</td>
                <td>{row.withAssets}</td>
                <td>{row.unused}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a className="district-more" href="#">Lihat Semua Kecamatan</a>
    </section>
  );
}

function LocationsTable({ rows, onAddLocation, onViewLocation, onEditLocation, onDeleteLocation, onFocusMap }) {
  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const districts = [...new Set(rows.map((row) => row.district))];
  const filteredRows = rows.filter((row) => {
    const text = `${row.idPemda || ""} ${row.name} ${row.locationName || ""} ${row.district} ${row.address || ""} ${row.description} ${row.status}`.toLowerCase();
    const matchesQuery = !query.trim() || text.includes(query.trim().toLowerCase());
    const matchesDistrict = !districtFilter || row.district === districtFilter;
    const matchesStatus = !statusFilter || row.status === statusFilter;
    return matchesQuery && matchesDistrict && matchesStatus;
  });

  return (
    <section className="admin-card locations-list-card">
      <div className="locations-list-head">
        <h2>Daftar Lokasi Aset</h2>
        <div>
          <button className="secondary-admin-button"><Icon name="download" /> Export</button>
          <button className="primary-admin-button" onClick={onAddLocation}><Icon name="plus" /> Tambah Lokasi</button>
        </div>
      </div>
      <div className="location-filters">
        <label>
          <input placeholder="Cari lokasi, kecamatan, alamat, atau deskripsi..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <Icon name="search" />
        </label>
        <select value={districtFilter} onChange={(event) => setDistrictFilter(event.target.value)}>
          <option value="">Semua Kecamatan</option>
          {districts.map((district) => <option value={district} key={district}>{district}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Semua Status</option><option>Aktif</option><option>Nonaktif</option><option>Tersedia</option><option>Dalam Proses</option><option>Terkontrak</option></select>
        <button type="button" onClick={() => { setQuery(""); setDistrictFilter(""); setStatusFilter(""); }}><Icon name="filter" /> Reset Filter</button>
      </div>
      <div className="table-wrap">
        <table className="locations-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Idpemda</th>
              <th>Foto</th>
              <th>Nama Aset</th>
              <th>Kecamatan</th>
              <th>Alamat Lengkap</th>
              <th>Deskripsi Lokasi</th>
              <th>Titik Koordinat</th>
              <th>Jumlah Aset</th>
              <th>Lokasi Strategis</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.idPemda || "-"}</td>
                <td>{row.photoUrl ? <img className="asset-thumb" src={row.photoUrl} alt={row.name} /> : <span className="photo-empty"><Icon name="image" /></span>}</td>
                <td><button className="table-link-button" onClick={() => onFocusMap(row)}>{row.name}</button></td>
                <td>{row.district}</td>
                <td>{row.address || row.description}</td>
                <td>{row.description}</td>
                <td>{row.lat !== null && row.lat !== undefined && row.lng !== null && row.lng !== undefined ? `${row.lat}, ${row.lng}` : "-"}</td>
                <td>{row.assetCount}</td>
                <td><span className={row.strategic ? "strategic yes" : "strategic"}><Icon name="flag" /> {row.strategic ? "Ya" : "Tidak"}</span></td>
                <td><span className="status-pill disetujui">{row.status}</span></td>
                <td>
                  <div className="row-actions">
                    <button aria-label={`Lihat ${row.name}`} onClick={() => onViewLocation(row)}><Icon name="eye" /></button>
                    <button aria-label={`Edit ${row.name}`} onClick={() => onEditLocation(row)}><Icon name="edit" /></button>
                    <button className="danger" aria-label={`Hapus ${row.name}`} onClick={() => onDeleteLocation(row.id)}><Icon name="trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredRows.length ? (
              <tr><td colSpan="11" className="empty-cell">Tidak ada lokasi yang cocok dengan pencarian atau filter.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Menampilkan {filteredRows.length} dari {rows.length} data lokasi</span>
        <div><button className="active">1</button></div>
      </div>
    </section>
  );
}

function LocationsPage() {
  const { data, error } = useLocationsData();
  const [locationsData, setLocationsData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewLocation, setViewLocation] = useState(null);
  const [editLocation, setEditLocation] = useState(null);
  const [selectedMapAsset, setSelectedMapAsset] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (data) setLocationsData(data);
  }, [data]);

  const refreshLocations = async () => {
    const response = await fetch("/api/admin/locations");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Gagal memuat ulang lokasi");
    setLocationsData(payload);
  };

  const deleteAssetLocation = async (id) => {
    setActionError("");
    const response = await fetch(`/api/asset-locations/${id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      setActionError(payload.error || "Gagal menghapus lokasi");
      return;
    }
    await refreshLocations();
  };

  const focusMapAsset = (row) => {
    setSelectedMapAsset(row);
    requestAnimationFrame(() => {
      document.getElementById("lokasi-peta-aset")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (error) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminTopbar title="Lokasi Aset" breadcrumb="Dashboard > Master Data > Lokasi Aset" />
          <div className="admin-state">Backend lokasi belum merespons: {error}</div>
        </main>
      </div>
    );
  }

  if (!locationsData) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminTopbar title="Lokasi Aset" breadcrumb="Dashboard > Master Data > Lokasi Aset" />
          <div className="admin-state">Memuat data lokasi...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <AdminTopbar user={data.user} title="Lokasi Aset" breadcrumb="Dashboard > Master Data > Lokasi Aset" />
        <div className="admin-content locations-content">
          {actionError ? <div className="login-error">{actionError}</div> : null}
          <section className="location-summary-grid">
            {locationsData.locationSummary.map((card) => <LocationSummaryCard card={card} key={card.id} />)}
          </section>
          <section className="locations-overview-grid" id="lokasi-peta-aset">
            <LocationMap districts={locationsData.locations} selectedLocation={selectedMapAsset} />
            <DistrictTable rows={locationsData.districtDistribution} />
          </section>
          <LocationsTable
            rows={locationsData.locations}
            onAddLocation={() => setShowAddModal(true)}
            onViewLocation={setViewLocation}
            onEditLocation={setEditLocation}
            onDeleteLocation={deleteAssetLocation}
            onFocusMap={focusMapAsset}
          />
        </div>
        {showAddModal ? (
          <AddLocationModal
            onClose={() => setShowAddModal(false)}
            onCreated={(location) => {
              setLocationsData((current) => ({
                ...current,
                locations: [...current.locations, location],
              }));
              setShowAddModal(false);
            }}
          />
        ) : null}
        {editLocation ? (
          <AddLocationModal
            initialData={editLocation}
            onClose={() => setEditLocation(null)}
            onCreated={async () => {
              await refreshLocations();
              setEditLocation(null);
            }}
          />
        ) : null}
        {viewLocation ? <LocationViewModal location={viewLocation} onClose={() => setViewLocation(null)} /> : null}
      </main>
    </div>
  );
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatArea(value) {
  if (!value) return "-";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "-";
    if (/^\d+([.,]\d+)?$/.test(trimmed)) return `${trimmed} m²`;
    return trimmed;
  }
  return `${Number(value).toLocaleString("id-ID")} m²`;
}

const assetImportColumns = [
  ["idPemda", "Idpemda"],
  ["name", "Nama Aset"],
  ["opdName", "Nama OPD"],
  ["category", "Kategori"],
  ["area", "Luas"],
  ["location", "Lokasi"],
  ["district", "Kecamatan"],
  ["address", "Alamat Lengkap"],
  ["lat", "Latitude"],
  ["lng", "Longitude"],
  ["scheme", "Skema"],
  ["valuePerYear", "Nilai per Tahun"],
  ["status", "Status"],
  ["potential", "Potensi"],
];

const normalizeHeader = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

function splitDelimitedLine(line, delimiter) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function parseAssetImport(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("File import minimal berisi header dan 1 baris data");
  const delimiter = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
  const headers = splitDelimitedLine(lines[0], delimiter);
  const headerMap = new Map(headers.map((header, index) => [normalizeHeader(header), index]));
  const aliases = {
    idPemda: ["idpemda", "idpem", "kodepemda", "kodeaset"],
    name: ["namaaset", "aset", "nama"],
    opdName: ["namaopd", "opd", "dinas", "organisasiperangkatdaerah"],
    category: ["kategori", "category"],
    area: ["luas", "luaslahan", "luastanah", "luasbangunan", "area", "size"],
    location: ["lokasi", "location"],
    district: ["kecamatan", "district"],
    address: ["alamatlengkap", "alamat", "address"],
    potential: ["potensi", "potensipemanfaatan", "potensipengembangan", "potential"],
    lat: ["latitude", "lat"],
    lng: ["longitude", "lng"],
    scheme: ["skema", "scheme"],
    valuePerYear: ["nilaipertahun", "nilaipotensipertahun", "nilai", "valueperyear"],
    status: ["status"],
  };
  return lines.slice(1).map((line) => {
    const cells = splitDelimitedLine(line, delimiter);
    const row = {};
    Object.entries(aliases).forEach(([key, names]) => {
      const index = names.map((name) => headerMap.get(name)).find((item) => item !== undefined);
      row[key] = index === undefined ? "" : cells[index];
    });
    row.valuePerYear = Number(String(row.valuePerYear || "0").replace(/[^\d]/g, ""));
    row.lat = row.lat === "" ? null : Number(String(row.lat).replace(",", "."));
    row.lng = row.lng === "" ? null : Number(String(row.lng).replace(",", "."));
    row.status = row.status || "Tersedia";
    return row;
  }).filter((row) => row.idPemda && row.name && row.opdName && row.category && row.location && row.scheme);
}

function exportAssetsToExcel(rows) {
  const escapeCell = (value) => String(value ?? "").replaceAll("\t", " ").replaceAll(/\r?\n/g, " ");
  const header = assetImportColumns.map(([, label]) => label).join("\t");
  const body = rows.map((asset) => assetImportColumns.map(([key]) => ["valuePerYear", "lat", "lng"].includes(key) ? Number(asset[key] || 0) : escapeCell(asset[key] || "")).join("\t")).join("\n");
  const blob = new Blob([[header, body].join("\n")], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `daftar-aset-dimanfaatkan-${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

function AssetsTable({ rows, categories, locations, onAddAsset, onImportAssets, onImportError, onViewAsset, onEditAsset, onDeleteAsset }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const importInputRef = useRef(null);
  const statuses = useMemo(() => [...new Set(rows.map((asset) => asset.status).filter(Boolean))], [rows]);
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((asset) => {
      const text = [
        asset.name,
        asset.idPemda,
        asset.opdName,
        asset.category,
        asset.area,
        asset.potential,
        asset.location,
        asset.district,
        asset.address,
        asset.lat,
        asset.lng,
        asset.scheme,
        asset.status,
      ].join(" ").toLowerCase();
      const matchesQuery = !normalizedQuery || text.includes(normalizedQuery);
      const matchesCategory = !categoryFilter || asset.category === categoryFilter;
      const matchesLocation = !locationFilter || asset.location === locationFilter;
      const matchesStatus = !statusFilter || asset.status === statusFilter;
      return matchesQuery && matchesCategory && matchesLocation && matchesStatus;
    });
  }, [rows, query, categoryFilter, locationFilter, statusFilter]);

  const resetFilters = () => {
    setQuery("");
    setCategoryFilter("");
    setLocationFilter("");
    setStatusFilter("");
  };

  return (
    <section className="admin-card locations-list-card">
      <div className="locations-list-head">
        <h2>Daftar Aset yang Dimanfaatkan</h2>
        <div>
          <button className="secondary-admin-button" onClick={() => importInputRef.current?.click()}><Icon name="upload" /> Import</button>
          <button className="secondary-admin-button" onClick={() => exportAssetsToExcel(filteredRows)}><Icon name="download" /> Export</button>
          <button className="primary-admin-button" onClick={onAddAsset}><Icon name="plus" /> Tambah Aset</button>
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,.xls,.txt"
            className="hidden-file-input"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              try {
                const text = await file.text();
                await onImportAssets(parseAssetImport(text));
              } catch (err) {
                onImportError(err.message || "Gagal membaca file import");
              }
            }}
          />
        </div>
      </div>
      <div className="location-filters asset-filters">
        <label>
          <input
            placeholder="Cari Idpemda, nama aset, OPD, kecamatan, atau skema..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Icon name="search" />
        </label>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="">Semua Kategori</option>
          {categories.map((category) => <option value={category} key={category}>{category}</option>)}
        </select>
        <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
          <option value="">Semua Lokasi</option>
          {locations.map((location) => <option value={location} key={location}>{location}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Semua Status</option>
          {statuses.map((status) => <option value={status} key={status}>{status}</option>)}
        </select>
        <button type="button" onClick={resetFilters}><Icon name="filter" /> Reset Filter</button>
      </div>
      <div className="table-wrap">
        <table className="assets-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Idpemda</th>
              <th>Nama Aset</th>
              <th>Foto</th>
              <th>Nama OPD</th>
              <th>Kategori</th>
              <th>Luas</th>
              <th>Kecamatan</th>
              <th>Alamat Lengkap</th>
              <th>Skema</th>
              <th>Nilai per Tahun</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((asset, index) => (
              <tr key={asset.id}>
                <td>{index + 1}</td>
                <td>{asset.idPemda || "-"}</td>
                <td>{asset.name}</td>
                <td>{asset.photoUrl ? <img className="asset-thumb" src={asset.photoUrl} alt={asset.name} /> : <span className="photo-empty"><Icon name="image" /></span>}</td>
                <td>{asset.opdName || "BPKAD Lombok Timur"}</td>
                <td>{asset.category}</td>
                <td>{formatArea(asset.area)}</td>
                <td>{asset.district || "-"}</td>
                <td>{asset.address || "-"}</td>
                <td>{asset.scheme}</td>
                <td>{formatRupiah(asset.valuePerYear)}</td>
                <td><span className={`status-pill ${asset.status.toLowerCase().replaceAll(" ", "-")}`}>{asset.status}</span></td>
                <td>
                  <div className="row-actions">
                    <button aria-label={`Lihat ${asset.name}`} onClick={() => onViewAsset(asset)}><Icon name="eye" /></button>
                    <button aria-label={`Edit ${asset.name}`} onClick={() => onEditAsset(asset)}><Icon name="edit" /></button>
                    <button className="danger" aria-label={`Hapus ${asset.name}`} onClick={() => onDeleteAsset(asset.id)}><Icon name="trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredRows.length ? (
              <tr>
                <td colSpan="13" className="empty-cell">Tidak ada aset yang cocok dengan pencarian atau filter.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Menampilkan {filteredRows.length} dari {rows.length} data aset</span>
        <div><button className="active">1</button></div>
      </div>
    </section>
  );
}

function AssetsPage() {
  const { data, error } = useAssetsData();
  const [assetsData, setAssetsData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewAsset, setViewAsset] = useState(null);
  const [editAsset, setEditAsset] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (data) setAssetsData(data);
  }, [data]);

  const deleteAsset = async (id) => {
    setActionError("");
    const response = await fetch(`/api/assets/${id}`, { method: "DELETE" });
    if (response.ok) {
      setAssetsData((current) => ({
        ...current,
        assets: current.assets.filter((asset) => asset.id !== id),
      }));
    }
  };

  const importAssets = async (rows) => {
    setActionError("");
    if (!rows.length) {
      setActionError("Tidak ada baris valid. Pastikan kolom Idpemda, Nama Aset, Nama OPD, Kategori, Lokasi, dan Skema terisi.");
      return;
    }
    const createdAssets = [];
    for (const row of rows) {
      const selectedLocation = assetsData.locationOptions?.find((location) => location.name === row.location);
      const normalizedRow = {
        ...row,
        district: row.district || selectedLocation?.district || "",
        address: row.address || selectedLocation?.address || "",
        lat: row.lat ?? selectedLocation?.lat ?? null,
        lng: row.lng ?? selectedLocation?.lng ?? null,
      };
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(normalizedRow),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `Gagal import aset ${row.name}`);
      createdAssets.push(payload);
    }
    setAssetsData((current) => ({
      ...current,
      assets: [...current.assets, ...createdAssets],
      locations: [...new Set([...current.locations, ...createdAssets.map((asset) => asset.location)])],
    }));
  };

  if (error) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminTopbar title="Data Aset" breadcrumb="Dashboard > Master Data > Data Aset" />
          <div className="admin-state">Backend aset belum merespons: {error}</div>
        </main>
      </div>
    );
  }

  if (!assetsData) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminTopbar title="Data Aset" breadcrumb="Dashboard > Master Data > Data Aset" />
          <div className="admin-state">Memuat data aset...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <AdminTopbar user={assetsData.user} title="Data Aset" breadcrumb="Dashboard > Master Data > Data Aset" />
        <div className="admin-content locations-content">
          <section className="location-summary-grid">
            {assetsData.assetSummary.map((card) => <LocationSummaryCard card={card} key={card.id} />)}
          </section>
          {actionError ? <div className="login-error">{actionError}</div> : null}
          <AssetsTable
            rows={assetsData.assets}
            categories={assetsData.categories}
            locations={assetsData.locations}
            onAddAsset={() => setShowAddModal(true)}
            onImportAssets={importAssets}
            onImportError={setActionError}
            onViewAsset={setViewAsset}
            onEditAsset={setEditAsset}
            onDeleteAsset={deleteAsset}
          />
        </div>
        {showAddModal ? (
          <AddAssetModal
            categories={assetsData.categories}
            locations={assetsData.locations}
            locationOptions={assetsData.locationOptions || []}
            onClose={() => setShowAddModal(false)}
            onCreated={(asset) => {
              setAssetsData((current) => ({
                ...current,
                assets: [...current.assets, asset],
                locations: [...new Set([...current.locations, asset.location])],
              }));
              setShowAddModal(false);
            }}
          />
        ) : null}
        {editAsset ? (
          <AddAssetModal
            categories={assetsData.categories}
            locations={assetsData.locations}
            locationOptions={assetsData.locationOptions || []}
            initialData={editAsset}
            onClose={() => setEditAsset(null)}
            onCreated={(asset) => {
              setAssetsData((current) => ({
                ...current,
                assets: current.assets.map((item) => item.id === asset.id ? asset : item),
                locations: [...new Set([...current.locations, asset.location])],
              }));
              setEditAsset(null);
            }}
          />
        ) : null}
        {viewAsset ? <AssetViewModal asset={viewAsset} onClose={() => setViewAsset(null)} /> : null}
      </main>
    </div>
  );
}

function AddAssetModal({ categories, locations, locationOptions, onClose, onCreated, initialData = null }) {
  const locationChoices = locationOptions.length ? locationOptions : locations.map((location) => ({ id: location, name: location, district: "", address: "" }));
  const firstLocation = locationChoices[0] || { name: "", district: "", address: "" };
  const initialPhotos = Array.isArray(initialData?.photos) && initialData.photos.length ? initialData.photos : (initialData?.photoUrl ? [initialData.photoUrl] : []);

  const [form, setForm] = useState({
    idPemda: "",
    name: "",
    opdName: "",
    category: categories[0] || "",
    area: "",
    location: firstLocation.name,
    district: firstLocation.district || "",
    address: firstLocation.address || "",
    lat: firstLocation.lat ?? "",
    lng: firstLocation.lng ?? "",
    scheme: "Sewa",
    status: "Tersedia",
    valuePerYear: "",
    potential: "",
    ...(initialData || {}),
    photos: initialPhotos,
    photoUrl: initialPhotos[0] || (initialData?.photoUrl || ""),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateLocation = (value) => {
    const selectedLocation = locationChoices.find((location) => location.name === value);
    setForm((current) => ({
      ...current,
      location: value,
      district: selectedLocation?.district || "",
      address: selectedLocation?.address || "",
      lat: selectedLocation?.lat ?? "",
      lng: selectedLocation?.lng ?? "",
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const finalPhotos = form.photos || [];
    const primaryPhoto = finalPhotos[0] || form.photoUrl || "";

    try {
      const response = await fetch(initialData ? `/api/assets/${initialData.id}` : "/api/assets", {
        method: initialData ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          area: typeof form.area === "string" ? form.area.trim() : (form.area || ""),
          potential: typeof form.potential === "string" ? form.potential.trim() : (form.potential || ""),
          photos: finalPhotos,
          photoUrl: primaryPhoto,
          valuePerYear: Number(form.valuePerYear || 0),
          lat: form.lat === "" ? null : Number(form.lat),
          lng: form.lng === "" ? null : Number(form.lng),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Gagal menambah aset");
      onCreated(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="location-modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <span>Master Data</span>
            <h2>{initialData ? "Edit Aset" : "Tambah Aset"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">×</button>
        </div>

        <div className="modal-body">
          {error ? <div className="login-error">{error}</div> : null}

          <div className="modal-grid">
            <MultiPhotoUploadField
              label="Foto Aset"
              photos={form.photos || []}
              onChange={(photos) => {
                setForm((current) => ({
                  ...current,
                  photos,
                  photoUrl: photos[0] || "",
                }));
              }}
              onError={setError}
            />
            <label>Idpemda<input required value={form.idPemda || ""} onChange={(event) => updateField("idPemda", event.target.value)} placeholder="Contoh: 03.11.01.001" /></label>
            <label className="wide">Nama Aset<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} /></label>
            <label className="wide">Nama OPD<input required value={form.opdName} onChange={(event) => updateField("opdName", event.target.value)} placeholder="Contoh: Dinas Pendidikan" /></label>
            <label>Kategori<select required value={form.category} onChange={(event) => updateField("category", event.target.value)}>{categories.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>
            <label>Luas (m²)<input value={form.area || ""} onChange={(event) => updateField("area", event.target.value)} placeholder="Contoh: 2.450 m² atau 2500" /></label>
            <label>Lokasi<select required value={form.location} onChange={(event) => updateLocation(event.target.value)}>{locationChoices.map((location) => <option value={location.name} key={location.id || location.name}>{location.name}</option>)}</select></label>
            <label>Kecamatan<input readOnly value={form.district || ""} /></label>
            <label>Latitude<input type="number" step="0.000001" value={form.lat ?? ""} onChange={(event) => updateField("lat", event.target.value)} placeholder="-8.6502" /></label>
            <label>Longitude<input type="number" step="0.000001" value={form.lng ?? ""} onChange={(event) => updateField("lng", event.target.value)} placeholder="116.5294" /></label>
            <label>Skema<select value={form.scheme} onChange={(event) => updateField("scheme", event.target.value)}><option>Sewa</option><option>Kerja Sama Pemanfaatan</option><option>BGS</option><option>Pinjam Pakai</option></select></label>
            <label>Status<select value={form.status} onChange={(event) => updateField("status", event.target.value)}><option>Tersedia</option><option>Dalam Proses</option><option>Terkontrak</option><option>Tidak Produktif</option></select></label>
            <label className="wide">Alamat Lengkap<textarea readOnly value={form.address || ""} /></label>
            <label className="wide">Potensi Pemanfaatan / Pengembangan<textarea rows={3} value={form.potential || ""} onChange={(event) => updateField("potential", event.target.value)} placeholder="Contoh: Sangat potensial untuk agrowisata, perhotelan, ruko komersial, atau sentra kuliner..." /></label>
            <label className="wide">Nilai Potensi per Tahun<input type="number" min="0" placeholder="12500000000" value={form.valuePerYear} onChange={(event) => updateField("valuePerYear", event.target.value)} /></label>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-admin-button" onClick={onClose}>Batal</button>
          <button type="submit" className="primary-admin-button" disabled={saving}>{saving ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Simpan Aset"}</button>
        </div>
      </form>
    </div>
  );
}

function AssetViewModal({ asset, onClose }) {
  const photos = Array.isArray(asset.photos) && asset.photos.length ? asset.photos : (asset.photoUrl ? [asset.photoUrl] : []);
  const details = [
    ["idPemda", "Idpemda"],
    ["name", "Nama Aset"],
    ["opdName", "Nama OPD"],
    ["category", "Kategori"],
    ["area", "Luas"],
    ["location", "Lokasi"],
    ["district", "Kecamatan"],
    ["address", "Alamat Lengkap"],
    ["coordinates", "Titik Koordinat"],
    ["scheme", "Skema"],
    ["valuePerYear", "Nilai per Tahun"],
    ["status", "Status"],
    ["potential", "Potensi"],
  ];

  const renderValue = (key) => {
    if (key === "valuePerYear") return formatRupiah(asset[key]);
    if (key === "coordinates") return asset.lat !== null && asset.lat !== undefined && asset.lng !== null && asset.lng !== undefined ? `${asset.lat}, ${asset.lng}` : "-";
    if (key === "area") return formatArea(asset.area);
    if (key === "potential") return asset.potential || asset.potensi || "-";
    return asset[key] || "-";
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="location-modal">
        <div className="modal-head">
          <div>
            <span>Detail Aset</span>
            <h2>{asset.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">×</button>
        </div>
        <div className="modal-body">
          {photos.length > 0 ? (
            <PhotoGalleryView photos={photos} title={asset.name} />
          ) : null}
          <div className="detail-grid">
            {details.map(([key, label]) => (
              <div key={key} className={key === "address" || key === "potential" || key === "name" ? "wide" : ""}>
                <span>{label}</span>
                <strong>{renderValue(key)}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="primary-admin-button" onClick={onClose}>Tutup</button>
        </div>
      </section>
    </div>
  );
}

function CategoriesTable({ rows, onAddCategory, onViewCategory, onEditCategory, onDeleteCategory }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((category) => {
      const text = [
        category.name,
        category.code,
        category.description,
        category.status,
      ].join(" ").toLowerCase();
      const matchesQuery = !normalizedQuery || text.includes(normalizedQuery);
      const matchesStatus = !statusFilter || category.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("");
  };

  return (
    <section className="admin-card locations-list-card">
      <div className="locations-list-head">
        <h2>Daftar Kategori Aset</h2>
        <div>
          <button className="secondary-admin-button"><Icon name="download" /> Export</button>
          <button className="primary-admin-button" onClick={onAddCategory}><Icon name="plus" /> Tambah Kategori</button>
        </div>
      </div>
      <div className="location-filters category-filters">
        <label>
          <input placeholder="Cari kategori, kode, atau deskripsi..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <Icon name="search" />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Semua Status</option><option>Aktif</option><option>Nonaktif</option></select>
        <button type="button" onClick={resetFilters}><Icon name="filter" /> Reset Filter</button>
      </div>
      <div className="table-wrap">
        <table className="categories-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Kategori</th>
              <th>Kode</th>
              <th>Deskripsi</th>
              <th>Jumlah Aset</th>
              <th>Total Nilai</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((category, index) => (
              <tr key={category.id}>
                <td>{index + 1}</td>
                <td><strong>{category.name}</strong></td>
                <td><span className="code-pill">{category.code}</span></td>
                <td>{category.description}</td>
                <td>{category.assetCount}</td>
                <td>{formatRupiah(category.totalValue)}</td>
                <td><span className="status-pill tersedia">{category.status}</span></td>
                <td>
                  <div className="row-actions">
                    <button aria-label={`Lihat ${category.name}`} onClick={() => onViewCategory(category)}><Icon name="eye" /></button>
                    <button aria-label={`Edit ${category.name}`} onClick={() => onEditCategory(category)}><Icon name="edit" /></button>
                    <button className="danger" aria-label={`Hapus ${category.name}`} onClick={() => onDeleteCategory(category.id)}><Icon name="trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredRows.length ? (
              <tr>
                <td colSpan="8" className="empty-cell">Tidak ada kategori yang cocok dengan pencarian atau filter.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Menampilkan {filteredRows.length} dari {rows.length} kategori aset</span>
        <div><button className="active">1</button></div>
      </div>
    </section>
  );
}

function CategoriesPage() {
  const { data, error } = useCategoriesData();
  const [categoriesData, setCategoriesData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewCategory, setViewCategory] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (data) setCategoriesData(data);
  }, [data]);

  const refreshCategories = async () => {
    const response = await fetch("/api/admin/categories");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Gagal memuat ulang kategori");
    setCategoriesData(payload);
  };

  const deleteCategory = async (id) => {
    setActionError("");
    const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      if (payload.requiresReplacement) {
        setPendingDelete({ id, ...payload });
        return;
      }
      setActionError(payload.error || "Gagal menghapus kategori");
      return;
    }
    await refreshCategories();
  };

  const deleteWithReplacement = async (replacement) => {
    if (!pendingDelete) return;
    setActionError("");
    const response = await fetch(`/api/categories/${pendingDelete.id}?replaceWith=${encodeURIComponent(replacement)}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      setActionError(payload.error || "Gagal menghapus kategori");
      return;
    }
    setPendingDelete(null);
    await refreshCategories();
  };

  if (error) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminTopbar title="Kategori Aset" breadcrumb="Dashboard > Master Data > Kategori Aset" />
          <div className="admin-state">Backend kategori belum merespons: {error}</div>
        </main>
      </div>
    );
  }

  if (!categoriesData) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminTopbar title="Kategori Aset" breadcrumb="Dashboard > Master Data > Kategori Aset" />
          <div className="admin-state">Memuat data kategori aset...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <AdminTopbar user={categoriesData.user} title="Kategori Aset" breadcrumb="Dashboard > Master Data > Kategori Aset" />
        <div className="admin-content locations-content">
          <section className="location-summary-grid category-summary-grid">
            {categoriesData.categorySummary.map((card) => <LocationSummaryCard card={card} key={card.id} />)}
          </section>
          {actionError ? <div className="login-error">{actionError}</div> : null}
          <CategoriesTable
            rows={categoriesData.categories}
            onAddCategory={() => setShowAddModal(true)}
            onViewCategory={setViewCategory}
            onEditCategory={setEditCategory}
            onDeleteCategory={deleteCategory}
          />
        </div>
        {showAddModal ? (
          <AddCategoryModal
            onClose={() => setShowAddModal(false)}
            onCreated={(category) => {
              setCategoriesData((current) => ({
                ...current,
                categories: [...current.categories, category],
              }));
              setShowAddModal(false);
            }}
          />
        ) : null}
        {editCategory ? (
          <AddCategoryModal
            initialData={editCategory}
            onClose={() => setEditCategory(null)}
            onCreated={async () => {
              await refreshCategories();
              setEditCategory(null);
            }}
          />
        ) : null}
        {viewCategory ? <CategoryViewModal category={viewCategory} onClose={() => setViewCategory(null)} /> : null}
        {pendingDelete ? (
          <ReplaceCategoryModal
            category={pendingDelete.category}
            assetCount={pendingDelete.assetCount}
            replacements={pendingDelete.replacements}
            onClose={() => setPendingDelete(null)}
            onConfirm={deleteWithReplacement}
          />
        ) : null}
      </main>
    </div>
  );
}

function ReplaceCategoryModal({ category, assetCount, replacements, onClose, onConfirm }) {
  const [replacement, setReplacement] = useState(replacements[0] || "");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!replacement) return;
    setSaving(true);
    try {
      await onConfirm(replacement);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="location-modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <span>Hapus Kategori</span>
            <h2>Pindahkan Aset Terlebih Dahulu</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">×</button>
        </div>

        <div className="modal-body">
          <div className="login-error">
            Kategori <strong>{category}</strong> masih digunakan oleh {assetCount} aset. Pilih kategori pengganti agar aset tetap rapi.
          </div>

          <div className="modal-grid">
            <label className="wide">
              Kategori Pengganti
              <select required value={replacement} onChange={(event) => setReplacement(event.target.value)}>
                {replacements.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-admin-button" onClick={onClose}>Batal</button>
          <button type="submit" className="primary-admin-button" disabled={saving || !replacement}>{saving ? "Memindahkan..." : "Pindahkan & Hapus"}</button>
        </div>
      </form>
    </div>
  );
}

function AddCategoryModal({ onClose, onCreated, initialData = null }) {
  const [form, setForm] = useState(initialData || { name: "", description: "", status: "Aktif" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(initialData ? `/api/categories/${initialData.id}` : "/api/categories", {
        method: initialData ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Gagal menyimpan kategori");
      onCreated(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="location-modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <span>Master Data</span>
            <h2>{initialData ? "Edit Kategori Aset" : "Tambah Kategori Aset"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">×</button>
        </div>

        <div className="modal-body">
          {error ? <div className="login-error">{error}</div> : null}

          <div className="modal-grid">
            <label>Nama Kategori<input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
            <label>Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option>Aktif</option><option>Nonaktif</option></select></label>
            <label className="wide">Deskripsi<textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Deskripsi singkat kategori aset" /></label>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-admin-button" onClick={onClose}>Batal</button>
          <button type="submit" className="primary-admin-button" disabled={saving}>{saving ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Simpan Kategori"}</button>
        </div>
      </form>
    </div>
  );
}

function CategoryViewModal({ category, onClose }) {
  const details = [
    ["name", "Nama Kategori"],
    ["code", "Kode"],
    ["description", "Deskripsi"],
    ["assetCount", "Jumlah Aset"],
    ["totalValue", "Total Nilai"],
    ["status", "Status"],
  ];

  const renderValue = (key) => {
    if (key === "totalValue") return formatRupiah(category[key]);
    return category[key] ?? "-";
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="location-modal">
        <div className="modal-head">
          <div>
            <span>Detail Kategori</span>
            <h2>{category.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">×</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            {details.map(([key, label]) => (
              <div key={key}>
                <span>{label}</span>
                <strong>{renderValue(key)}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="primary-admin-button" onClick={onClose}>Tutup</button>
        </div>
      </section>
    </div>
  );
}

function HorizontalBarChart({ title, rows, suffix = "" }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <section className="admin-card stat-chart-card">
      <h2>{title}</h2>
      <div className="stat-bars">
        {rows.map((row) => (
          <div className="stat-bar-row" key={row.label}>
            <span>{row.label}</span>
            <div><i style={{ width: `${(row.value / max) * 100}%` }}></i></div>
            <strong>{suffix === "T" ? `Rp ${row.value.toFixed(2).replace(".", ",")} T` : `${row.value.toLocaleString("id-ID")}${suffix}`}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function MiniDonut({ title, rows, center = "" }) {
  let cursor = 0;
  const gradient = rows.map((row) => {
    const start = cursor;
    cursor += row.value;
    return `${row.color} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <section className="admin-card stat-donut-card">
      <h2>{title}</h2>
      <div className="stat-donut-layout">
        <div className="stat-donut" style={{ background: `conic-gradient(${gradient})` }}>
          <div>{center}</div>
        </div>
        <div className="stat-donut-legend">
          {rows.map((row) => (
            <div key={row.label}><span style={{ background: row.color }}></span><strong>{row.label}</strong><em>{row.value}% {row.count ? `(${row.count.toLocaleString("id-ID")})` : ""}</em></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificationTrend({ rows }) {
  const width = 460;
  const height = 220;
  const pad = 34;
  const max = 12000;
  const points = (key) => rows.map((row, index) => {
    const x = pad + index * ((width - pad * 1.6) / (rows.length - 1));
    const y = height - pad - (row[key] / max) * (height - pad * 1.8);
    return `${x},${y}`;
  }).join(" ");

  return (
    <section className="admin-card stat-chart-card">
      <h2>Perkembangan Sertifikasi Aset (Unit)</h2>
      <svg viewBox={`0 0 ${width} ${height}`} className="stat-line">
        {[0, 4000, 8000, 12000].map((value) => {
          const y = height - pad - (value / max) * (height - pad * 1.8);
          return <g key={value}><line x1={pad} x2={width - 12} y1={y} y2={y} /><text x="4" y={y + 4}>{value.toLocaleString("id-ID")}</text></g>;
        })}
        {rows.map((row, index) => {
          const x = pad + index * ((width - pad * 1.6) / (rows.length - 1));
          return <text className="month" x={x - 12} y={height - 8} key={row.year}>{row.year}</text>;
        })}
        <polyline points={points("certified")} className="line green-line" />
        <polyline points={points("uncertified")} className="line red-line" />
      </svg>
      <div className="chart-legend"><span className="green-dot"></span>Bersertifikat <span className="red-dot"></span>Belum Sertifikat</div>
    </section>
  );
}

function DistrictSpreadMap({ rows }) {
  return (
    <section className="admin-card stat-map-card">
      <h2>Sebaran Aset per Kecamatan</h2>
      <div className="stat-map">
        {rows.map((row) => <span className="stat-map-pin" style={{ left: `${row.x}%`, top: `${row.y}%` }} key={row.label}>{row.value}</span>)}
        <button className="map-control plus-control">+</button>
        <button className="map-control minus-control">-</button>
      </div>
    </section>
  );
}

function ReportDonut({ rows = [], total = 0 }) {
  const colors = ["#1b69d1", "#15945d", "#f59e0b", "#7c3dcc", "#2f80ed", "#94a3b8"];
  const sum = rows.reduce((value, row) => value + Number(row.value || 0), 0) || 1;
  let cursor = 0;
  const gradient = rows.map((row, index) => {
    const start = cursor;
    cursor += (Number(row.value || 0) / sum) * 100;
    return `${colors[index % colors.length]} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <section className="admin-card report-card">
      <h2>Pendapatan Berdasarkan Jenis Pemanfaatan</h2>
      <div className="report-donut-layout">
        <div className="report-donut" style={{ background: `conic-gradient(${gradient})` }}>
          <div><span>Total</span><strong>{formatRupiah(total)}</strong></div>
        </div>
        <div className="report-legend">
          {rows.map((row, index) => (
            <div key={row.label}><i style={{ background: colors[index % colors.length] }}></i><span>{row.label}</span><strong>{formatRupiah(row.value)}</strong></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportMonthlyChart({ rows = [] }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <section className="admin-card report-card report-wide-card">
      <h2>Pendapatan (PAD) per Bulan <span>(dalam rupiah)</span></h2>
      <div className="report-column-chart">
        {rows.map((row) => (
          <div className="report-column" key={row.month}>
            <strong>{formatRupiah(row.value)}</strong>
            <i style={{ height: `${Math.max(8, (row.value / max) * 150)}px` }}></i>
            <span>{row.month}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportOpdChart({ rows = [] }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <section className="admin-card report-card">
      <h2>Pendapatan (PAD) per OPD</h2>
      <div className="report-opd-bars">
        {rows.map((row) => (
          <div className="report-opd-row" key={row.label}>
            <span>{row.label}</span>
            <div><i style={{ width: `${(row.value / max) * 100}%` }}></i></div>
            <strong>{formatRupiah(row.value)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function UtilizationReportTable({ rows = [] }) {
  return (
    <section className="admin-card report-table-card">
      <h2>Rincian Pemanfaatan Aset</h2>
      <div className="table-wrap">
        <table className="report-table">
          <thead>
            <tr><th>No</th><th>Nama Aset</th><th>Lokasi</th><th>OPD Pengelola</th><th>Jenis Pemanfaatan</th><th>Mitra</th><th>Nomor Perjanjian</th><th>Mulai</th><th>Berakhir</th><th>Nilai Kontrak</th><th>Pendapatan / Tahun</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || index}>
                <td>{index + 1}</td><td>{row.asset}</td><td>{row.location}</td><td>{row.opd}</td><td>{row.type}</td><td>{row.partner}</td><td>{row.number}</td><td>{row.startDate}</td><td>{row.endDate}</td><td>{formatRupiah(row.contractValue)}</td><td>{formatRupiah(row.yearlyRevenue)}</td><td><span className={`status-pill ${String(row.status).toLowerCase().replaceAll(" ", "-")}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer"><span>Menampilkan {rows.length} data laporan</span><div><button className="active">1</button></div></div>
    </section>
  );
}

function UtilizationReportPage() {
  const { data, error } = useUtilizationReportData();
  const [filters, setFilters] = useState({ period: "", opd: "", scheme: "", status: "" });

  if (error || !data) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminTopbar title="Laporan Pemanfaatan Aset Daerah" breadcrumb="Dashboard > Monitoring & Laporan > Laporan" />
          <div className="admin-state">{error || "Memuat laporan pemanfaatan aset..."}</div>
        </main>
      </div>
    );
  }

  const filteredRows = data.details.filter((row) => {
    const matchesOpd = !filters.opd || row.opd === filters.opd;
    const matchesScheme = !filters.scheme || row.type === filters.scheme;
    const matchesStatus = !filters.status || row.status === filters.status;
    return matchesOpd && matchesScheme && matchesStatus;
  });
  const totalPad = data.revenueByType.reduce((sum, row) => sum + Number(row.value || 0), 0);

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <AdminTopbar user={data.user} title="Laporan Pemanfaatan Aset Daerah" breadcrumb="Informasi lengkap terkait pemanfaatan dan pendapatan dari aset daerah" />
        <div className="admin-content report-content">
          <section className="report-actions">
            <div></div>
            <button className="secondary-admin-button"><Icon name="download" /> Cetak</button>
            <button className="primary-admin-button"><Icon name="download" /> Unduh Laporan</button>
          </section>
          <section className="admin-card report-filter-card">
            <label>Periode Laporan<input value={filters.period || data.period} onChange={(event) => setFilters((current) => ({ ...current, period: event.target.value }))} /></label>
            <label>OPD Pengelola<select value={filters.opd} onChange={(event) => setFilters((current) => ({ ...current, opd: event.target.value }))}><option value="">Semua OPD</option>{data.opdOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Jenis Pemanfaatan<select value={filters.scheme} onChange={(event) => setFilters((current) => ({ ...current, scheme: event.target.value }))}><option value="">Semua Jenis</option>{data.schemeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Status<select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">Semua Status</option>{data.statusOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <button className="primary-admin-button"><Icon name="filter" /> Terapkan Filter</button>
          </section>
          <section className="location-summary-grid report-summary-grid">
            {data.summary.map((card) => <LocationSummaryCard card={card} key={card.id} />)}
          </section>
          <section className="report-chart-grid">
            <ReportDonut rows={data.revenueByType} total={totalPad} />
            <ReportMonthlyChart rows={data.monthlyRevenue} />
            <ReportOpdChart rows={data.revenueByOpd} />
          </section>
          <section className="report-bottom-grid">
            <UtilizationReportTable rows={filteredRows} />
            <section className="admin-card report-side-summary">
              <h2>Ringkasan Laporan</h2>
              {data.reportSummary.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatisticsPage() {
  const { data, error } = useStatisticsData();

  if (error || !data) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminTopbar title="Statistik Aset Daerah" breadcrumb="Dashboard > Monitoring & Laporan > Statistik" />
          <div className="admin-state">{error || "Memuat statistik aset..."}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <AdminTopbar user={data.user} title="Statistik Aset Daerah" breadcrumb="Visualisasi data aset daerah dalam berbagai perspektif" />
        <div className="admin-content statistics-content">
          <section className="statistics-grid">
            <HorizontalBarChart title="Aset per OPD (Jumlah)" rows={data.opdAssets} />
            <MiniDonut title="Komposisi Jenis Aset" rows={data.assetComposition} />
            <MiniDonut title="Status Sertifikasi" rows={data.certification} center="79%" />
            <CertificationTrend rows={data.certificationTrend} />
            <DistrictSpreadMap rows={data.districtSpread} />
            <HorizontalBarChart title="Nilai Aset per OPD (Rp)" rows={data.opdValues} suffix="T" />
          </section>
          <section className="stat-kpi-row">
            {data.kpis.map((kpi) => <div className="admin-card stat-kpi" key={kpi.label}><strong>{kpi.value}</strong><span>{kpi.label}</span></div>)}
          </section>
        </div>
      </main>
    </div>
  );
}

const masterConfigs = {
  articles: {
    kind: "articles",
    endpoint: "/api/articles",
    title: "Pengumuman, Berita & Artikel",
    breadcrumb: "Dashboard > Informasi Publik > Pengumuman, Berita & Artikel",
    addLabel: "Tambah Informasi",
    defaults: { name: "", title: "", category: "Berita", author: "Admin", publishedDate: "", summary: "", content: "", imageUrl: "", images: [], hotTopic: true, status: "Terbit" },
    columns: [["title", "Judul"], ["category", "Kategori"], ["author", "Penulis"], ["publishedDate", "Tanggal"], ["hotTopic", "Hot Topic"], ["status", "Status"]],
    fields: [["title", "Judul"], ["category", "Kategori", "select", ["Berita", "Artikel", "Pengumuman"]], ["author", "Penulis"], ["publishedDate", "Tanggal Terbit"], ["status", "Status", "select", ["Terbit", "Draft"]], ["hotTopic", "Jadikan Hot Topic", "checkbox"], ["images", "Upload Gambar Artikel", "multi-image-upload"], ["summary", "Ringkasan"], ["content", "Isi Artikel Lengkap untuk Halaman Baca Berita", "textarea"]],
  },
  schemes: {
    kind: "schemes",
    endpoint: "/api/schemes",
    title: "Skema Pemanfaatan",
    breadcrumb: "Dashboard > Master Data > Skema Pemanfaatan",
    addLabel: "Tambah Skema",
    defaults: { name: "", code: "", description: "", assetCount: 0, duration: "1-5 tahun", status: "Aktif" },
    columns: [["name", "Nama Skema"], ["code", "Kode"], ["description", "Deskripsi"], ["assetCount", "Jumlah Aset"], ["duration", "Durasi"], ["status", "Status"]],
    fields: [["name", "Nama Skema"], ["code", "Kode"], ["duration", "Durasi"], ["status", "Status", "select", ["Aktif", "Nonaktif"]], ["description", "Deskripsi", "textarea"]],
  },
  users: {
    kind: "users",
    endpoint: "/api/users",
    title: "Pengguna",
    breadcrumb: "Dashboard > Master Data > Pengguna",
    addLabel: "Tambah Pengguna",
    defaults: { name: "", username: "", password: "", email: "", role: "Viewer", unit: "", status: "Aktif", lastLogin: "Belum pernah" },
    columns: [["name", "Nama"], ["username", "Username"], ["password", "Password"], ["email", "Email"], ["role", "Role"], ["unit", "Unit"], ["status", "Status"], ["lastLogin", "Login Terakhir"]],
    fields: [["name", "Nama"], ["username", "Username"], ["password", "Password"], ["email", "Email"], ["role", "Role"], ["unit", "Unit"], ["status", "Status", "select", ["Aktif", "Nonaktif"]]],
  },
  roles: {
    kind: "roles",
    endpoint: "/api/roles",
    title: "Role & Hak Akses",
    breadcrumb: "Dashboard > Master Data > Role & Hak Akses",
    addLabel: "Tambah Role",
    defaults: { name: "", description: "", userCount: 0, permissions: ["Lihat Dashboard"], status: "Aktif" },
    columns: [["name", "Nama Role"], ["description", "Deskripsi"], ["userCount", "Jumlah Pengguna"], ["permissions", "Hak Akses"], ["status", "Status"]],
    fields: [["name", "Nama Role"], ["userCount", "Jumlah Pengguna", "number"], ["status", "Status", "select", ["Aktif", "Nonaktif"]], ["permissions", "Hak Akses", "permissions"], ["description", "Deskripsi", "textarea"]],
  },
  opportunities: {
    kind: "opportunities",
    endpoint: "/api/opportunities",
    title: "Peluang Aset",
    breadcrumb: "Dashboard > Komersialisasi > Peluang Aset",
    addLabel: "Tambah Peluang",
    defaults: { name: "", asset: "", category: "", location: "", estimatedValue: 0, status: "Aktif" },
    columns: [["name", "Nama Peluang"], ["asset", "Aset"], ["category", "Kategori"], ["location", "Lokasi"], ["estimatedValue", "Estimasi Nilai"], ["status", "Status"]],
    fields: [["name", "Nama Peluang"], ["asset", "Nama Aset"], ["category", "Kategori"], ["location", "Lokasi"], ["estimatedValue", "Estimasi Nilai", "number"], ["status", "Status", "select", ["Aktif", "Nonaktif"]]],
  },
  utilizationSubmissions: {
    kind: "utilization-submissions",
    endpoint: "/api/utilization-submissions",
    title: "Pengajuan Pemanfaatan",
    breadcrumb: "Dashboard > Komersialisasi > Pengajuan Pemanfaatan",
    addLabel: "Tambah Pengajuan",
    defaults: { asset: "", applicant: "", scheme: "Sewa", date: "", status: "Menunggu Verifikasi" },
    columns: [["asset", "Nama Aset"], ["applicant", "Pemohon"], ["scheme", "Skema"], ["date", "Tanggal Pengajuan"], ["status", "Status"]],
    fields: [["asset", "Nama Aset"], ["applicant", "Pemohon"], ["scheme", "Skema"], ["date", "Tanggal Pengajuan"], ["status", "Status", "select", ["Menunggu Verifikasi", "Proses Evaluasi", "Disetujui", "Ditolak"]]],
  },
  partnerships: {
    kind: "partnerships",
    endpoint: "/api/partnerships",
    title: "Kerja Sama",
    breadcrumb: "Dashboard > Komersialisasi > Kerja Sama",
    addLabel: "Tambah Kerja Sama",
    defaults: { partner: "", asset: "", scheme: "Sewa", startDate: "", endDate: "", status: "Aktif" },
    columns: [["partner", "Mitra"], ["asset", "Aset"], ["scheme", "Skema"], ["startDate", "Mulai"], ["endDate", "Berakhir"], ["status", "Status"]],
    fields: [["partner", "Mitra"], ["asset", "Aset"], ["scheme", "Skema"], ["startDate", "Mulai"], ["endDate", "Berakhir"], ["status", "Status", "select", ["Aktif", "Selesai", "Dibatalkan"]]],
  },
  contracts: {
    kind: "contracts",
    endpoint: "/api/contracts",
    title: "Kontrak",
    breadcrumb: "Dashboard > Komersialisasi > Kontrak",
    addLabel: "Tambah Kontrak",
    defaults: { number: "", partner: "", asset: "", contractValue: 0, signedDate: "", pdfName: "", pdfUrl: "", status: "Aktif" },
    columns: [["number", "Nomor Kontrak"], ["partner", "Mitra"], ["asset", "Aset"], ["contractValue", "Nilai Kontrak"], ["signedDate", "Tanggal TTD"], ["pdfName", "File PDF"], ["status", "Status"]],
    fields: [["number", "Nomor Kontrak"], ["partner", "Mitra"], ["asset", "Aset"], ["contractValue", "Nilai Kontrak", "number"], ["signedDate", "Tanggal TTD"], ["status", "Status", "select", ["Aktif", "Selesai", "Dibatalkan"]], ["pdfUrl", "Upload File PDF", "file-pdf"]],
  },
  payments: {
    kind: "payments",
    endpoint: "/api/payments",
    title: "Pembayaran & Setoran",
    breadcrumb: "Dashboard > Komersialisasi > Pembayaran & Setoran",
    addLabel: "Tambah Pembayaran",
    defaults: { invoice: "", payer: "", asset: "", amount: 0, paymentDate: "", status: "Menunggu Pembayaran" },
    columns: [["invoice", "Invoice"], ["payer", "Pembayar"], ["asset", "Aset"], ["amount", "Nominal"], ["paymentDate", "Tanggal Bayar"], ["status", "Status"]],
    fields: [["invoice", "Invoice"], ["payer", "Pembayar"], ["asset", "Aset"], ["amount", "Nominal", "number"], ["paymentDate", "Tanggal Bayar"], ["status", "Status", "select", ["Menunggu Pembayaran", "Lunas", "Terlambat"]]],
  },
  assetAppraisals: {
    kind: "asset-appraisals",
    endpoint: "/api/asset-appraisals",
    title: "Penilaian Aset",
    breadcrumb: "Dashboard > Penilaian & Keuangan > Penilaian Aset",
    addLabel: "Tambah Penilaian",
    defaults: { name: "", asset: "", appraiser: "", method: "Pendekatan Pasar", appraisalValue: 0, date: "", status: "Proses Evaluasi" },
    columns: [["name", "Nama Penilaian"], ["asset", "Aset"], ["appraiser", "Penilai"], ["method", "Metode"], ["appraisalValue", "Nilai Penilaian"], ["date", "Tanggal"], ["status", "Status"]],
    fields: [["name", "Nama Penilaian"], ["asset", "Aset"], ["appraiser", "Penilai"], ["method", "Metode", "select", ["Pendekatan Pasar", "Pendekatan Pendapatan", "Pendekatan Biaya"]], ["appraisalValue", "Nilai Penilaian", "number"], ["date", "Tanggal"], ["status", "Status", "select", ["Proses Evaluasi", "Selesai", "Ditolak"]]],
  },
  potentialValues: {
    kind: "potential-values",
    endpoint: "/api/potential-values",
    title: "Nilai Potensi",
    breadcrumb: "Dashboard > Penilaian & Keuangan > Nilai Potensi",
    addLabel: "Tambah Nilai Potensi",
    defaults: { name: "", asset: "", category: "", location: "", annualPotential: 0, realizationTarget: 0, status: "Aktif" },
    columns: [["name", "Nama Potensi"], ["asset", "Aset"], ["category", "Kategori"], ["location", "Lokasi"], ["annualPotential", "Potensi Tahunan"], ["realizationTarget", "Target (%)"], ["status", "Status"]],
    fields: [["name", "Nama Potensi"], ["asset", "Aset"], ["category", "Kategori"], ["location", "Lokasi"], ["annualPotential", "Potensi Tahunan", "number"], ["realizationTarget", "Target Realisasi (%)", "number"], ["status", "Status", "select", ["Aktif", "Nonaktif"]]],
  },
  padRevenues: {
    kind: "pad-revenues",
    endpoint: "/api/pad-revenues",
    title: "Pendapatan (PAD)",
    breadcrumb: "Dashboard > Penilaian & Keuangan > Pendapatan (PAD)",
    addLabel: "Tambah Pendapatan",
    defaults: { name: "", source: "", asset: "", period: "", target: 0, realization: 0, status: "Belum Tercapai" },
    columns: [["name", "Nama Pendapatan"], ["source", "Sumber"], ["asset", "Aset"], ["period", "Periode"], ["target", "Target"], ["realization", "Realisasi"], ["status", "Status"]],
    fields: [["name", "Nama Pendapatan"], ["source", "Sumber"], ["asset", "Aset"], ["period", "Periode"], ["target", "Target", "number"], ["realization", "Realisasi", "number"], ["status", "Status", "select", ["Tercapai", "Belum Tercapai"]]],
  },
  financialReports: {
    kind: "financial-reports",
    endpoint: "/api/financial-reports",
    title: "Laporan Keuangan",
    breadcrumb: "Dashboard > Penilaian & Keuangan > Laporan Keuangan",
    addLabel: "Tambah Laporan",
    defaults: { name: "", period: "", type: "Realisasi PAD", preparedBy: "", publishedDate: "", status: "Draft" },
    columns: [["name", "Nama Laporan"], ["period", "Periode"], ["type", "Jenis"], ["preparedBy", "Disusun Oleh"], ["publishedDate", "Tanggal Terbit"], ["status", "Status"]],
    fields: [["name", "Nama Laporan"], ["period", "Periode"], ["type", "Jenis", "select", ["Realisasi PAD", "Potensi Aset", "Piutang", "Laporan Tahunan"]], ["preparedBy", "Disusun Oleh"], ["publishedDate", "Tanggal Terbit"], ["status", "Status", "select", ["Draft", "Terbit", "Revisi"]]],
  },
  assetMonitorings: {
    kind: "asset-monitorings",
    endpoint: "/api/asset-monitorings",
    title: "Monitoring Aset",
    breadcrumb: "Dashboard > Monitoring & Laporan > Monitoring Aset",
    addLabel: "Tambah Monitoring",
    defaults: { name: "", asset: "", location: "", condition: "Baik", lastInspection: "", officer: "", status: "Aktif" },
    columns: [["name", "Nama Monitoring"], ["asset", "Aset"], ["location", "Lokasi"], ["condition", "Kondisi"], ["lastInspection", "Inspeksi Terakhir"], ["officer", "Petugas"], ["status", "Status"]],
    fields: [["name", "Nama Monitoring"], ["asset", "Aset"], ["location", "Lokasi"], ["condition", "Kondisi", "select", ["Baik", "Perlu Perawatan", "Rusak Ringan", "Rusak Berat"]], ["lastInspection", "Inspeksi Terakhir"], ["officer", "Petugas"], ["status", "Status", "select", ["Aktif", "Nonaktif"]]],
  },
  statisticalReports: {
    kind: "statistical-reports",
    endpoint: "/api/statistical-reports",
    title: "Statistik",
    breadcrumb: "Dashboard > Monitoring & Laporan > Statistik",
    addLabel: "Tambah Statistik",
    defaults: { name: "", period: "", type: "Kategori", metric: "", generatedBy: "", status: "Draft" },
    columns: [["name", "Nama Laporan"], ["period", "Periode"], ["type", "Jenis"], ["metric", "Metrik"], ["generatedBy", "Dibuat Oleh"], ["status", "Status"]],
    fields: [["name", "Nama Laporan"], ["period", "Periode"], ["type", "Jenis", "select", ["Kategori", "Pemanfaatan", "Keuangan", "Kinerja"]], ["metric", "Metrik"], ["generatedBy", "Dibuat Oleh"], ["status", "Status", "select", ["Draft", "Terbit", "Revisi"]]],
  },
};

function MasterCrudPage({ config }) {
  const { data, error } = useMasterData(config.kind);
  const [pageData, setPageData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);

  useEffect(() => {
    if (data) setPageData(data);
  }, [data]);

  const deleteRow = async (id) => {
    const response = await fetch(`${config.endpoint}/${id}`, { method: "DELETE" });
    if (response.ok) setPageData((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== id) }));
  };

  if (error || !pageData) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminTopbar title={config.title} breadcrumb={config.breadcrumb} />
          <div className="admin-state">{error || `Memuat data ${config.title.toLowerCase()}...`}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <AdminTopbar user={pageData.user} title={config.title} breadcrumb={config.breadcrumb} />
        <div className="admin-content locations-content">
          <section className="location-summary-grid category-summary-grid">
            {pageData.summary.map((card) => <LocationSummaryCard card={card} key={card.id} />)}
          </section>
          <GenericMasterTable rows={pageData.rows} config={config} onAdd={() => setShowModal(true)} onView={setViewRow} onEdit={setEditRow} onDelete={deleteRow} />
        </div>
        {showModal ? (
          <GenericMasterModal
            config={config}
            onClose={() => setShowModal(false)}
            onCreated={(row) => {
              setPageData((current) => ({ ...current, rows: [...current.rows, row] }));
              setShowModal(false);
            }}
          />
        ) : null}
        {editRow ? (
          <GenericMasterModal
            config={config}
            initialData={editRow}
            onClose={() => setEditRow(null)}
            onCreated={(row) => {
              setPageData((current) => ({ ...current, rows: current.rows.map((item) => item.id === row.id ? row : item) }));
              setEditRow(null);
            }}
          />
        ) : null}
        {viewRow ? <GenericViewModal row={viewRow} config={config} onClose={() => setViewRow(null)} /> : null}
      </main>
    </div>
  );
}

function GenericMasterTable({ rows, config, onAdd, onView, onEdit, onDelete }) {
  const renderValue = (value, key, row) => {
    if (key === "permissions" && Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Ya" : "Tidak";
    if (key === "status") return <span className={`status-pill ${String(value).toLowerCase().replaceAll(" ", "-")}`}>{value}</span>;
    if (key === "code") return <span className="code-pill">{value}</span>;
    if (key === "pdfName") return row.pdfUrl ? <a className="pdf-link" href={row.pdfUrl} target="_blank" rel="noreferrer"><Icon name="doc" /> {value || "Lihat PDF"}</a> : "-";
    if (["estimatedValue", "contractValue", "amount", "appraisalValue", "annualPotential", "target", "realization"].includes(key)) return formatRupiah(value);
    return value;
  };

  return (
    <section className="admin-card locations-list-card">
      <div className="locations-list-head">
        <h2>Daftar {config.title}</h2>
        <div>
          <button className="secondary-admin-button"><Icon name="download" /> Export</button>
          <button className="primary-admin-button" onClick={onAdd}><Icon name="plus" /> {config.addLabel}</button>
        </div>
      </div>
      <div className="location-filters category-filters">
        <label><input placeholder={`Cari ${config.title.toLowerCase()}...`} /><Icon name="search" /></label>
        <select><option>Semua Status</option><option>Aktif</option><option>Nonaktif</option></select>
        <button><Icon name="filter" /> Filter</button>
      </div>
      <div className="table-wrap">
        <table className="generic-master-table">
          <thead><tr><th>No</th>{config.columns.map(([, label]) => <th key={label}>{label}</th>)}<th>Aksi</th></tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                {config.columns.map(([key]) => <td key={key}>{renderValue(row[key], key, row)}</td>)}
                <td><div className="row-actions"><button onClick={() => onView(row)}><Icon name="eye" /></button><button onClick={() => onEdit(row)}><Icon name="edit" /></button><button className="danger" onClick={() => onDelete(row.id)}><Icon name="trash" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer"><span>Menampilkan {rows.length} data</span><div><button className="active">1</button></div></div>
    </section>
  );
}

function GenericMasterModal({ config, onClose, onCreated, initialData = null }) {
  const [form, setForm] = useState(initialData || config.defaults);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updatePdfFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("File kontrak harus berformat PDF");
      return;
    }
    if (file.size > 2500000) {
      setError("Ukuran PDF maksimal 2,5 MB agar penyimpanan lokal tetap ringan");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, pdfName: file.name, pdfUrl: reader.result }));
      setError("");
    };
    reader.onerror = () => setError("Gagal membaca file PDF");
    reader.readAsDataURL(file);
  };

  const updateImageFile = (file, key = "imageUrl") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }
    if (file.size > 1200000) {
      setError("Ukuran gambar maksimal 1,2 MB agar data lokal tetap ringan");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, [key]: reader.result }));
      setError("");
    };
    reader.onerror = () => setError("Gagal membaca file gambar");
    reader.readAsDataURL(file);
  };

  const updateMultipleImages = (files, key = "images") => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    if (selectedFiles.some((file) => !file.type.startsWith("image/"))) {
      setError("Semua file harus berupa gambar");
      return;
    }
    if (selectedFiles.some((file) => file.size > 1200000)) {
      setError("Setiap gambar maksimal 1,2 MB agar data lokal tetap ringan");
      return;
    }
    Promise.all(selectedFiles.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })))
      .then((images) => {
        setForm((current) => ({ ...current, [key]: [...(current[key] || []), ...images].slice(0, 8), imageUrl: images[0] || current.imageUrl || "" }));
        setError("");
      })
      .catch(() => setError("Gagal membaca file gambar"));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form };
    if (config.kind === "roles" && typeof payload.permissions === "string") payload.permissions = payload.permissions.split(",").map((item) => item.trim()).filter(Boolean);
    if (payload.userCount !== undefined) payload.userCount = Number(payload.userCount || 0);
    if (payload.assetCount !== undefined) payload.assetCount = Number(payload.assetCount || 0);
    if (payload.estimatedValue !== undefined) payload.estimatedValue = Number(payload.estimatedValue || 0);
    if (payload.contractValue !== undefined) payload.contractValue = Number(payload.contractValue || 0);
    if (payload.amount !== undefined) payload.amount = Number(payload.amount || 0);
    if (payload.appraisalValue !== undefined) payload.appraisalValue = Number(payload.appraisalValue || 0);
    if (payload.annualPotential !== undefined) payload.annualPotential = Number(payload.annualPotential || 0);
    if (payload.realizationTarget !== undefined) payload.realizationTarget = Number(payload.realizationTarget || 0);
    if (payload.target !== undefined) payload.target = Number(payload.target || 0);
    if (payload.realization !== undefined) payload.realization = Number(payload.realization || 0);

    try {
      const response = await fetch(initialData ? `${config.endpoint}/${initialData.id}` : config.endpoint, { method: initialData ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menyimpan data");
      onCreated(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="location-modal" onSubmit={submit}>
        <div className="modal-head"><div><span>Master Data</span><h2>{initialData ? `Edit ${config.title}` : config.addLabel}</h2></div><button type="button" onClick={onClose} aria-label="Tutup">×</button></div>
        <div className="modal-body">
          {error ? <div className="login-error">{error}</div> : null}
          <div className="modal-grid">
            {config.fields.map(([key, label, type = "text", options]) => (
              <label className={["textarea", "file-pdf", "image-upload", "multi-image-upload"].includes(type) ? "wide" : ""} key={key}>
                {label}
                {type === "textarea" ? (
                  <textarea value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} />
                ) : type === "select" ? (
                  <select value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}>{options.map((option) => <option key={option}>{option}</option>)}</select>
                ) : type === "file-pdf" ? (
                  <div className="pdf-upload-field">
                    <input type="file" accept="application/pdf" onChange={(event) => updatePdfFile(event.target.files?.[0])} />
                    <span>{form.pdfName ? `File: ${form.pdfName}` : "Belum ada PDF kontrak"}</span>
                    {form.pdfUrl ? <a href={form.pdfUrl} target="_blank" rel="noreferrer">Lihat PDF</a> : null}
                  </div>
                ) : type === "image-upload" ? (
                  <div className="article-image-upload">
                    <div style={{ backgroundImage: `url(${form[key] || heroImage})` }}></div>
                    <section>
                      <input type="file" accept="image/*" onChange={(event) => updateImageFile(event.target.files?.[0], key)} />
                      <span>Upload gambar artikel, maksimal 1,2 MB.</span>
                      {form[key] ? <button type="button" className="secondary-admin-button" onClick={() => setForm((current) => ({ ...current, [key]: "" }))}>Hapus Gambar</button> : null}
                    </section>
                  </div>
                ) : type === "multi-image-upload" ? (
                  <div className="article-image-upload multi-image-upload">
                    <div style={{ backgroundImage: `url(${(form[key] || [])[0] || form.imageUrl || heroImage})` }}></div>
                    <section>
                      <input type="file" accept="image/*" multiple onChange={(event) => updateMultipleImages(event.target.files, key)} />
                      <span>Upload beberapa gambar artikel. Maksimal 8 gambar, masing-masing 1,2 MB.</span>
                      <div className="multi-image-preview">
                        {(form[key] || []).map((image, index) => <i key={`${image.slice(0, 24)}-${index}`} style={{ backgroundImage: `url(${image})` }}></i>)}
                      </div>
                      {(form[key] || []).length ? <button type="button" className="secondary-admin-button" onClick={() => setForm((current) => ({ ...current, [key]: [], imageUrl: "" }))}>Hapus Semua Gambar</button> : null}
                    </section>
                  </div>
                ) : type === "checkbox" ? (
                  <label className="check-field"><input type="checkbox" checked={Boolean(form[key])} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))} /> Tampilkan di Hot Topic Beranda</label>
                ) : type === "permissions" ? (
                  <div className="permission-list">
                    {permissionOptions.map((permission) => (
                      <label className="permission-item" key={permission}>
                        <input
                          type="checkbox"
                          checked={(form[key] || []).includes(permission)}
                          onChange={(event) => setForm((current) => {
                            const currentPermissions = current[key] || [];
                            return {
                              ...current,
                              [key]: event.target.checked
                                ? [...currentPermissions, permission]
                                : currentPermissions.filter((item) => item !== permission),
                            };
                          })}
                        />
                        {permission}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input required={key === "name"} type={type} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} />
                )}
              </label>
            ))}
          </div>
        </div>
        <div className="modal-actions"><button type="button" className="secondary-admin-button" onClick={onClose}>Batal</button><button type="submit" className="primary-admin-button" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button></div>
      </form>
    </div>
  );
}

function GenericViewModal({ row, config, onClose }) {
  const renderDetail = (value, key) => {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Ya" : "Tidak";
    if (key === "pdfName") return row.pdfUrl ? <a className="pdf-link" href={row.pdfUrl} target="_blank" rel="noreferrer"><Icon name="doc" /> {value || "Lihat PDF"}</a> : "-";
    if (["estimatedValue", "contractValue", "amount", "appraisalValue", "annualPotential", "target", "realization"].includes(key)) return formatRupiah(value);
    return value ?? "-";
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="location-modal">
        <div className="modal-head"><div><span>Detail Data</span><h2>{row.name || config.title}</h2></div><button type="button" onClick={onClose} aria-label="Tutup">×</button></div>
        <div className="modal-body">
          <div className="detail-grid">
            {config.columns.map(([key, label]) => (
              <div key={key}>
                <span>{label}</span>
                <strong>{renderDetail(row[key], key)}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions"><button type="button" className="primary-admin-button" onClick={onClose}>Tutup</button></div>
      </section>
    </div>
  );
}

function AddLocationModal({ onClose, onCreated, initialData = null }) {
  const initialPhotos = Array.isArray(initialData?.photos) && initialData.photos.length ? initialData.photos : (initialData?.photoUrl ? [initialData.photoUrl] : []);

  const [form, setForm] = useState({
    name: "",
    district: "",
    address: "",
    description: "",
    assetCount: "0",
    strategic: false,
    status: "Aktif",
    lat: "",
    lng: "",
    ...(initialData || {}),
    photos: initialPhotos,
    photoUrl: initialPhotos[0] || (initialData?.photoUrl || ""),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const finalPhotos = form.photos || [];
    const primaryPhoto = finalPhotos[0] || form.photoUrl || "";

    try {
      const response = await fetch(initialData ? `/api/asset-locations/${initialData.id}` : "/api/locations", {
        method: initialData ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          photos: finalPhotos,
          photoUrl: primaryPhoto,
          assetCount: Number(form.assetCount || 0),
          lat: form.lat === "" ? null : Number(form.lat),
          lng: form.lng === "" ? null : Number(form.lng),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Gagal menyimpan lokasi");
      onCreated(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="location-modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <span>Master Data</span>
            <h2>{initialData ? "Edit Lokasi Aset" : "Tambah Lokasi"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">×</button>
        </div>

        <div className="modal-body">
          {error ? <div className="login-error">{error}</div> : null}

          <div className="modal-grid">
            <MultiPhotoUploadField
              label="Foto Lokasi"
              photos={form.photos || []}
              onChange={(photos) => {
                setForm((current) => ({
                  ...current,
                  photos,
                  photoUrl: photos[0] || "",
                }));
              }}
              onError={setError}
            />
            {initialData ? <label>Idpemda<input value={form.idPemda || ""} onChange={(event) => updateField("idPemda", event.target.value)} /></label> : null}
            <label>{initialData ? "Nama Aset" : "Nama Lokasi"}<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} /></label>
            <label>Kecamatan<input required value={form.district} onChange={(event) => updateField("district", event.target.value)} /></label>
            <label className="wide">Alamat Lengkap<textarea required value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Contoh: Jl. Raya Pancor, Kecamatan Sakra Timur, Kabupaten Lombok Timur" /></label>
            <label className="wide">Deskripsi Lokasi<textarea required value={form.description} onChange={(event) => updateField("description", event.target.value)} /></label>
            <label>Jumlah Aset<input type="number" min="0" value={form.assetCount} onChange={(event) => updateField("assetCount", event.target.value)} /></label>
            <label>Status<select value={form.status} onChange={(event) => updateField("status", event.target.value)}><option>Aktif</option><option>Nonaktif</option></select></label>
            <label>Latitude<input type="number" step="0.000001" placeholder="-8.6502" value={form.lat} onChange={(event) => updateField("lat", event.target.value)} /></label>
            <label>Longitude<input type="number" step="0.000001" placeholder="116.5294" value={form.lng} onChange={(event) => updateField("lng", event.target.value)} /></label>
            <label className="check-field"><input type="checkbox" checked={form.strategic} onChange={(event) => updateField("strategic", event.target.checked)} /> Lokasi Strategis</label>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-admin-button" onClick={onClose}>Batal</button>
          <button type="submit" className="primary-admin-button" disabled={saving}>{saving ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Simpan Lokasi"}</button>
        </div>
      </form>
    </div>
  );
}

function LocationViewModal({ location, onClose }) {
  const photos = Array.isArray(location.photos) && location.photos.length ? location.photos : (location.photoUrl ? [location.photoUrl] : []);
  const details = [
    ["idPemda", "Idpemda"],
    ["name", "Nama Aset"],
    ["locationName", "Lokasi"],
    ["district", "Kecamatan"],
    ["address", "Alamat Lengkap"],
    ["description", "Deskripsi Lokasi"],
    ["coordinates", "Titik Koordinat"],
    ["assetCount", "Jumlah Aset"],
    ["status", "Status"],
  ];

  const renderValue = (key) => {
    if (key === "coordinates") return location.lat !== null && location.lat !== undefined && location.lng !== null && location.lng !== undefined ? `${location.lat}, ${location.lng}` : "-";
    return location[key] ?? "-";
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="location-modal">
        <div className="modal-head">
          <div>
            <span>Detail Lokasi</span>
            <h2>{location.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup">×</button>
        </div>
        <div className="modal-body">
          {photos.length > 0 ? (
            <PhotoGalleryView photos={photos} title={location.name} />
          ) : null}
          <div className="detail-grid">
            {details.map(([key, label]) => (
              <div key={key}>
                <span>{label}</span>
                <strong>{renderValue(key)}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="primary-admin-button" onClick={onClose}>Tutup</button>
        </div>
      </section>
    </div>
  );
}

function LoginPage({ message = "" }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginInfo, setLoginInfo] = useState(appInfo);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/app-info")
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (alive && payload?.appInfo) setLoginInfo(payload.appInfo);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Login gagal");
      }

      localStorage.setItem("peta_admin_session", payload.token);
      localStorage.setItem("peta_admin_user", JSON.stringify(payload.user));
      window.location.href = "/admin";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand"><BrandBlock info={loginInfo} /></div>
        <h1>Dashboard Pengelolaan Aset Daerah</h1>
        <p>Masuk sebagai administrator untuk mengelola data aset, pengajuan pemanfaatan, kontrak, dan laporan PAD.</p>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={submitLogin}>
          <div>
            <span>Admin Area</span>
            <h2>Masuk ke Dashboard</h2>
            <p>Gunakan akun admin yang terdaftar pada backend aplikasi.</p>
          </div>

          {message ? <div className="login-info">{message}</div> : null}
          {error ? <div className="login-error">{error}</div> : null}

          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="admin" autoComplete="username" />
          </label>

          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="admin123" type="password" autoComplete="current-password" />
          </label>

          <button type="submit" disabled={loading}>{loading ? "Memeriksa..." : "Masuk"}</button>

          <small>Demo: username <strong>admin</strong>, password <strong>admin123</strong></small>
        </form>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
