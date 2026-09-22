import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkPostgresConnection,
  createLocation,
  deleteLocation,
  getAdminUser,
  getLocations,
  hasPostgres,
  migratePostgres,
  updateLocation,
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(__dirname, "data.json");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type, authorization",
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
};

const defaultAppInfo = {
  name: "PETA-LOTIM",
  shortName: "PETA-LOTIM",
  description: "Portal Elektronik Lombok Timur untuk mengelola data aset, lokasi, komersialisasi, penilaian, keuangan, monitoring, dan statistik aset daerah.",
  copyright: "© 2024 Portal Kabupaten Lombok Timur. All rights reserved.",
  version: "1.0.0",
  maintainer: "Pemerintah Kabupaten Lombok Timur",
  logoUrl: "",
};

async function readDb() {
  return JSON.parse(await readFile(dataPath, "utf8"));
}

async function writeDb(db) {
  await writeFile(dataPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response, status, payload) {
  response.writeHead(status, jsonHeaders);
  response.end(JSON.stringify(payload));
}

function notFound(response) {
  sendJson(response, 404, { error: "Resource tidak ditemukan" });
}

function getId(pathname) {
  const match = pathname.match(/\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function syncLocationFromAsset(db, asset) {
  if (!asset?.idPemda) return;
  const index = db.locations.findIndex((location) => location.idPemda === asset.idPemda);
  const existing = index === -1 ? {} : db.locations[index];
  const locationRow = {
    id: existing.id || Math.max(0, ...db.locations.map((location) => Number(location.id) || 0)) + 1,
    idPemda: asset.idPemda,
    assetId: asset.id,
    assetName: asset.name,
    name: asset.location,
    locationName: asset.location,
    district: asset.district || existing.district || "",
    address: asset.address || existing.address || "",
    description: `Aset berada di ${asset.location}`,
    assetCount: 1,
    strategic: Boolean(existing.strategic),
    status: asset.status || existing.status || "Aktif",
    lat: asset.lat ?? existing.lat ?? null,
    lng: asset.lng ?? existing.lng ?? null,
    photoUrl: asset.photoUrl || existing.photoUrl || (Array.isArray(asset.photos) && asset.photos[0]) || "",
    photos: Array.isArray(asset.photos) && asset.photos.length ? asset.photos : (existing.photos || (asset.photoUrl ? [asset.photoUrl] : [])),
  };
  if (index === -1) db.locations.push(locationRow);
  else db.locations[index] = locationRow;
}

function removeLocationForAsset(db, asset) {
  if (!asset?.idPemda) return;
  db.locations = db.locations.filter((location) => location.idPemda !== asset.idPemda);
}

function syncLocationsFromAssets(db) {
  const before = JSON.stringify(db.locations);
  db.assets.forEach((asset) => syncLocationFromAsset(db, asset));
  return JSON.stringify(db.locations) !== before;
}

function buildAssetLocations(db, masterLocations = db.locations) {
  const masterByName = new Map(masterLocations.map((location) => [location.name, location]));
  const locationByIdPemda = new Map(masterLocations.filter((location) => location.idPemda).map((location) => [location.idPemda, location]));
  return db.assets.map((asset) => {
    const joinedLocation = locationByIdPemda.get(asset.idPemda) || {};
    const master = masterByName.get(asset.location) || {};
    const photos = Array.isArray(asset.photos) && asset.photos.length ? asset.photos : (joinedLocation.photos || master.photos || (asset.photoUrl ? [asset.photoUrl] : []));
    return {
      id: asset.id,
      assetId: asset.id,
      idPemda: asset.idPemda || "-",
      name: asset.name,
      assetName: asset.name,
      locationName: asset.location,
      district: asset.district || joinedLocation.district || master.district || "-",
      address: asset.address || joinedLocation.address || master.address || master.description || "-",
      description: joinedLocation.description || `Aset berada di ${asset.location}`,
      assetCount: 1,
      strategic: Boolean(joinedLocation.strategic ?? master.strategic),
      status: asset.status || "Aktif",
      lat: asset.lat ?? joinedLocation.lat ?? master.lat ?? null,
      lng: asset.lng ?? joinedLocation.lng ?? master.lng ?? null,
      photoUrl: asset.photoUrl || joinedLocation.photoUrl || master.photoUrl || (photos[0] || ""),
      photos,
    };
  });
}

function formatRupiahShort(value) {
  const amount = Number(value || 0);
  if (amount >= 1000000000000) return `Rp ${(amount / 1000000000000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} T`;
  if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`;
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatAssetArea(asset) {
  const area = asset.area || asset.landArea || asset.buildingArea || asset.size;
  if (!area) return "-";
  if (typeof area === "string") {
    const trimmed = area.trim();
    if (!trimmed) return "-";
    if (/^\d+([.,]\d+)?$/.test(trimmed)) {
      return `${trimmed} m²`;
    }
    return trimmed;
  }
  return `${Number(area).toLocaleString("id-ID")} m²`;
}

function buildPublicHomeData(db) {
  const assets = db.assets || [];
  const categories = db.categories || [];
  const totalValue = assets.reduce((sum, asset) => sum + Number(asset.valuePerYear || 0), 0);
  const opdCount = new Set(assets.map((asset) => asset.opdName).filter(Boolean)).size;
  const availableCount = assets.filter((asset) => asset.status === "Tersedia").length;
  const featuredAssets = assets.slice(0, 4).map((asset, index) => ({
    id: asset.id,
    idPemda: asset.idPemda || "-",
    title: asset.name,
    meta: asset.category || "Aset Daerah",
    location: [asset.district, asset.address || asset.location].filter(Boolean).join(", "),
    area: formatAssetArea(asset),
    potential: asset.potential || asset.potensi || "-",
    scheme: asset.scheme || "-",
    value: `${formatRupiahShort(asset.valuePerYear)} / tahun`,
    imageUrl: asset.photoUrl || (Array.isArray(asset.photos) && asset.photos[0]) || "",
    photos: Array.isArray(asset.photos) && asset.photos.length ? asset.photos : (asset.photoUrl ? [asset.photoUrl] : []),
    pos: ["0% 0%", "100% 0%", "0% 100%", "100% 100%"][index % 4],
  }));

  const publicAssets = assets.map((asset, index) => ({
    id: asset.id,
    idPemda: asset.idPemda || "-",
    title: asset.name,
    meta: asset.category || "Aset Daerah",
    location: [asset.district, asset.address || asset.location].filter(Boolean).join(", "),
    district: asset.district || asset.location || "-",
    address: asset.address || "-",
    area: formatAssetArea(asset),
    potential: asset.potential || asset.potensi || "-",
    scheme: asset.scheme || "-",
    status: asset.status || "-",
    value: `${formatRupiahShort(asset.valuePerYear)} / tahun`,
    valuePerYear: Number(asset.valuePerYear || 0),
    imageUrl: asset.photoUrl || (Array.isArray(asset.photos) && asset.photos[0]) || "",
    photos: Array.isArray(asset.photos) && asset.photos.length ? asset.photos : (asset.photoUrl ? [asset.photoUrl] : []),
    lat: asset.lat ?? null,
    lng: asset.lng ?? null,
    pos: ["0% 0%", "100% 0%", "0% 100%", "100% 100%"][index % 4],
  }));

  return {
    assets: publicAssets,
    featuredAssets,
    newAssets: [...publicAssets].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)).slice(0, 8),
    opportunities: (db.opportunities || []).map((item) => ({
      id: item.id,
      name: item.name,
      asset: item.asset,
      category: item.category,
      location: item.location,
      status: item.status,
      value: formatRupiahShort(item.estimatedValue),
      estimatedValue: Number(item.estimatedValue || 0),
    })),
    articles: (db.articles || []).filter((item) => item.status !== "Draft").sort((a, b) => Number(b.hotTopic === true) - Number(a.hotTopic === true) || Number(b.id || 0) - Number(a.id || 0)).slice(0, 5),
    categories: categories.map((name) => ({
      name,
      assetCount: assets.filter((asset) => asset.category === name).length,
    })),
    locations: [...new Set(assets.map((asset) => asset.district || asset.location).filter(Boolean))],
    schemes: [...new Set(assets.map((asset) => asset.scheme).filter(Boolean))],
    stats: [
      { icon: "building", label: "Total Aset", value: String(assets.length), tone: "blue" },
      { icon: "money", label: "Nilai Potensi (per tahun)", value: formatRupiahShort(totalValue), tone: "green" },
      { icon: "office", label: "Pemerintah Daerah", value: String(opdCount || 1), tone: "purple" },
      { icon: "box", label: "Aset Tersedia", value: String(availableCount), tone: "orange" },
    ],
  };
}

function summaryFor(label, rows, icon) {
  const active = rows.filter((row) => row.status === "Aktif").length;
  return [
    { id: "total", label: `Total ${label}`, value: String(rows.length), helper: "Data terdaftar", icon, tone: "blue" },
    { id: "active", label: `${label} Aktif`, value: String(active), helper: "Status aktif", icon: "check", tone: "green" },
    { id: "inactive", label: `${label} Nonaktif`, value: String(rows.length - active), helper: "Perlu evaluasi", icon: "hourglass", tone: "orange" },
  ];
}

const permissionCatalog = [
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

function userWithPermissions(db, username, pgUser = null) {
  const jsonUser = db.users?.find((item) => item.username?.toLowerCase() === username);
  const baseUser = pgUser
    ? { name: pgUser.name, role: pgUser.role, notifications: pgUser.notifications, username }
    : jsonUser || { ...db.user, username: db.auth?.username || "admin" };
  const role = db.roles?.find((item) => item.name === baseUser.role);
  return {
    name: baseUser.name,
    username: baseUser.username,
    role: baseUser.role,
    notifications: baseUser.notifications ?? db.user?.notifications ?? 0,
    permissions: role?.permissions || ["Lihat Dashboard"],
  };
}

async function handleApi(request, response, url) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, jsonHeaders);
    response.end();
    return;
  }

  const db = await readDb();

  if (url.pathname === "/api/health" && request.method === "GET") {
    sendJson(response, 200, {
      status: "ok",
      service: "PETA API",
      database: hasPostgres() ? "postgres" : "json",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (url.pathname === "/api/auth/login" && request.method === "POST") {
    const { username, password } = await readBody(request);
    const submittedUsername = String(username || "").trim().toLowerCase();
    const submittedPassword = String(password || "").trim();
    const pgUser = await getAdminUser(submittedUsername);
    const jsonUser = db.users?.find((item) => item.username?.toLowerCase() === submittedUsername);
    const expectedUsername = pgUser?.username || jsonUser?.username || db.auth?.username || "admin";
    const expectedPassword = pgUser?.password_text || jsonUser?.password || db.auth?.password || "admin123";
    const user = userWithPermissions(db, submittedUsername, pgUser);

    if (submittedUsername === expectedUsername && submittedPassword === expectedPassword) {
      sendJson(response, 200, {
        token: "demo-admin-session",
        user,
      });
      return;
    }
    sendJson(response, 401, { error: "Username atau password salah" });
    return;
  }

  if (url.pathname === "/api/admin/dashboard" && request.method === "GET") {
    const commercialCount = db.opportunities.length + db.utilizationSubmissions.length + db.partnerships.length + db.contracts.length + db.payments.length;
    const financeCount = db.assetAppraisals.length + db.potentialValues.length + db.padRevenues.length + db.financialReports.length;
    const monitoringCount = db.assetMonitorings.length + db.statisticalReports.length;
    const totalPad = db.padRevenues.reduce((sum, row) => sum + Number(row.realization || 0), 0);
    const totalPotential = db.potentialValues.reduce((sum, row) => sum + Number(row.annualPotential || 0), 0);
    const summaryCards = [
      { id: "assets", label: "TOTAL ASET", value: String(db.assets.length), helper: "Data aset", icon: "building", tone: "blue", href: "/admin/aset" },
      { id: "locations", label: "TOTAL LOKASI", value: String(db.locations.length), helper: "Lokasi aset", icon: "pin", tone: "green", href: "/admin/lokasi" },
      { id: "commercial", label: "KOMERSIALISASI", value: String(commercialCount), helper: "Data proses", icon: "handshake", tone: "orange", href: "/admin/peluang-aset" },
      { id: "finance", label: "PENILAIAN & KEUANGAN", value: String(financeCount), helper: "Data keuangan", icon: "money", tone: "purple", href: "/admin/penilaian-aset" },
      { id: "monitoring", label: "MONITORING & LAPORAN", value: String(monitoringCount), helper: "Data pantauan", icon: "monitor", tone: "cyan", href: "/admin/monitoring-aset" },
      { id: "pad", label: "REALISASI PAD", value: `Rp ${(totalPad / 1000000000).toLocaleString("id-ID")} M`, helper: "Pendapatan", icon: "receipt", tone: "pink", href: "/admin/pendapatan-pad" }
    ];
    const moduleOverview = [
      { group: "Master Data", href: "/admin/aset", icon: "box", tone: "blue", items: [
        { label: "Data Aset", value: db.assets.length, href: "/admin/aset" },
        { label: "Kategori Aset", value: db.categories.length, href: "/admin/kategori" },
        { label: "Lokasi", value: db.locations.length, href: "/admin/lokasi" },
        { label: "Skema", value: db.schemes.length, href: "/admin/skema" },
        { label: "Pengguna", value: db.users.length, href: "/admin/pengguna" },
        { label: "Role", value: db.roles.length, href: "/admin/role" }
      ] },
      { group: "Komersialisasi", href: "/admin/peluang-aset", icon: "handshake", tone: "orange", items: [
        { label: "Peluang Aset", value: db.opportunities.length, href: "/admin/peluang-aset" },
        { label: "Pengajuan", value: db.utilizationSubmissions.length, href: "/admin/pengajuan-pemanfaatan" },
        { label: "Kerja Sama", value: db.partnerships.length, href: "/admin/kerja-sama" },
        { label: "Kontrak", value: db.contracts.length, href: "/admin/kontrak" },
        { label: "Pembayaran", value: db.payments.length, href: "/admin/pembayaran" }
      ] },
      { group: "Penilaian & Keuangan", href: "/admin/penilaian-aset", icon: "calculator", tone: "green", items: [
        { label: "Penilaian Aset", value: db.assetAppraisals.length, href: "/admin/penilaian-aset" },
        { label: "Nilai Potensi", value: `Rp ${(totalPotential / 1000000000).toLocaleString("id-ID")} M`, href: "/admin/nilai-potensi" },
        { label: "Pendapatan PAD", value: `Rp ${(totalPad / 1000000000).toLocaleString("id-ID")} M`, href: "/admin/pendapatan-pad" },
        { label: "Laporan Keuangan", value: db.financialReports.length, href: "/admin/laporan-keuangan" }
      ] },
      { group: "Monitoring & Laporan", href: "/admin/monitoring-aset", icon: "monitor", tone: "purple", items: [
        { label: "Monitoring Aset", value: db.assetMonitorings.length, href: "/admin/monitoring-aset" },
        { label: "Statistik", value: db.statisticalReports.length, href: "/admin/laporan-statistik" }
      ] }
    ];
    const { monthlyPad, categoryBreakdown, activities, submissions, statusBreakdown, documents, user } = db;
    sendJson(response, 200, { summaryCards, moduleOverview, monthlyPad, categoryBreakdown, activities, submissions, statusBreakdown, documents, user, appInfo: { ...defaultAppInfo, ...(db.appInfo || {}) } });
    return;
  }

  if (url.pathname === "/api/admin/app-info" && request.method === "GET") {
    sendJson(response, 200, { appInfo: { ...defaultAppInfo, ...(db.appInfo || {}) }, user: db.user });
    return;
  }

  if (url.pathname === "/api/admin/app-info" && request.method === "PUT") {
    const payload = await readBody(request);
    db.appInfo = {
      ...defaultAppInfo,
      ...(db.appInfo || {}),
      name: String(payload.name || "").trim() || defaultAppInfo.name,
      shortName: String(payload.shortName || "").trim() || defaultAppInfo.shortName,
      description: String(payload.description || "").trim() || defaultAppInfo.description,
      copyright: String(payload.copyright || "").replace(/\uFFFD/g, "\u00a9").trim() || defaultAppInfo.copyright,
      version: String(payload.version || "").trim() || defaultAppInfo.version,
      maintainer: String(payload.maintainer || "").trim() || defaultAppInfo.maintainer,
      logoUrl: String(payload.logoUrl || "").trim(),
    };
    await writeDb(db);
    sendJson(response, 200, { appInfo: db.appInfo, user: db.user });
    return;
  }

  if (url.pathname === "/api/admin/locations" && request.method === "GET") {
    if (syncLocationsFromAssets(db)) await writeDb(db);
    const postgresLocations = await getLocations();
    const masterLocations = postgresLocations || db.locations;
    const locations = buildAssetLocations(db, masterLocations);
    const districtDistribution = locations.map((location, index) => ({
      id: index + 1,
      district: location.district,
      location: location.address,
      withAssets: location.name,
      unused: "-",
    }));
    const locationSummary = [
      { id: "total-locations", label: "Total Lokasi", value: String(locations.length), helper: "Dari aset dimanfaatkan", icon: "pin", tone: "blue" },
      { id: "active-locations", label: "Lokasi Aktif", value: String(locations.filter((location) => location.status !== "Nonaktif").length), helper: "Lokasi", icon: "shield", tone: "green" },
      { id: "locations-with-assets", label: "Lokasi dengan Aset", value: String(locations.filter((location) => location.assetCount > 0).length), helper: "Dari daftar aset", icon: "office", tone: "purple" },
      { id: "mapped-coordinates", label: "Titik Koordinat", value: String(locations.filter((location) => location.lat !== null && location.lng !== null).length), helper: "Lokasi terpeta", icon: "map", tone: "orange" },
      { id: "location-photos", label: "Foto Lokasi", value: String(locations.filter((location) => location.photoUrl).length), helper: "Foto tersedia", icon: "image", tone: "pink" },
    ];
    sendJson(response, 200, { locationSummary, districtDistribution, locations, user: db.user });
    return;
  }

  if (url.pathname === "/api/admin/assets" && request.method === "GET") {
    const assets = db.assets;
    const locationRows = await getLocations() || db.locations;
    const totalValue = assets.reduce((sum, asset) => sum + Number(asset.valuePerYear || 0), 0);
    const available = assets.filter((asset) => asset.status === "Tersedia").length;
    const inProcess = assets.filter((asset) => asset.status === "Dalam Proses").length;
    const contracted = assets.filter((asset) => asset.status === "Terkontrak").length;
    const categories = db.categories;
    const locationOptions = locationRows.map((location) => ({
      id: location.id,
      name: location.name,
      district: location.district,
      address: location.address || location.description,
      lat: location.lat,
      lng: location.lng,
    }));
    const locations = locationOptions.map((location) => location.name);
    const assetSummary = [
      { id: "total-assets", label: "Total Aset", value: String(assets.length), helper: "Aset terdata", icon: "building", tone: "blue" },
      { id: "available-assets", label: "Aset Tersedia", value: String(available), helper: "Siap dimanfaatkan", icon: "check", tone: "green" },
      { id: "process-assets", label: "Dalam Proses", value: String(inProcess), helper: "Evaluasi berjalan", icon: "doc", tone: "cyan" },
      { id: "contracted-assets", label: "Terkontrak", value: String(contracted), helper: "Sudah kerja sama", icon: "handshake", tone: "purple" },
      { id: "asset-value", label: "Nilai Potensi", value: `Rp ${(totalValue / 1000000000).toLocaleString("id-ID")} M`, helper: "per tahun", icon: "money", tone: "orange" },
    ];
    sendJson(response, 200, { assetSummary, assets, categories, locations, locationOptions, user: db.user });
    return;
  }

  if (url.pathname === "/api/admin/categories" && request.method === "GET") {
    const categoryRows = db.categories.map((name, index) => {
      const relatedAssets = db.assets.filter((asset) => asset.category === name);
      const totalValue = relatedAssets.reduce((sum, asset) => sum + Number(asset.valuePerYear || 0), 0);
      return {
        id: index + 1,
        name,
        code: name.toUpperCase().replace(/\s+/g, "-"),
        description: `Kategori aset ${name} milik Pemerintah Kabupaten Lombok Timur`,
        assetCount: relatedAssets.length,
        totalValue,
        status: "Aktif",
      };
    });
    const categorySummary = [
      { id: "total-categories", label: "Total Kategori", value: String(categoryRows.length), helper: "Kategori aset", icon: "folder", tone: "blue" },
      { id: "active-categories", label: "Kategori Aktif", value: String(categoryRows.filter((row) => row.status === "Aktif").length), helper: "Siap digunakan", icon: "check", tone: "green" },
      { id: "mapped-assets", label: "Aset Terkategori", value: String(db.assets.length), helper: "Aset", icon: "building", tone: "purple" },
      { id: "top-category", label: "Kategori Terbesar", value: categoryRows.sort((a, b) => b.assetCount - a.assetCount)[0]?.name || "-", helper: "Jumlah aset terbanyak", icon: "star", tone: "orange" },
    ];
    sendJson(response, 200, { categorySummary, categories: categoryRows, user: db.user });
    return;
  }

  if (url.pathname === "/api/admin/schemes" && request.method === "GET") {
    sendJson(response, 200, {
      summary: summaryFor("Skema", db.schemes, "doc"),
      rows: db.schemes,
      user: db.user,
    });
    return;
  }

  if (url.pathname === "/api/admin/users" && request.method === "GET") {
    sendJson(response, 200, {
      summary: summaryFor("Pengguna", db.users, "user"),
      rows: db.users,
      roles: db.roles.map((role) => role.name),
      user: db.user,
    });
    return;
  }

  if (url.pathname === "/api/admin/roles" && request.method === "GET") {
    sendJson(response, 200, {
      summary: summaryFor("Role", db.roles, "lock"),
      rows: db.roles,
      permissions: permissionCatalog,
      user: db.user,
    });
    return;
  }

  if (url.pathname === "/api/admin/articles" && request.method === "GET") {
    sendJson(response, 200, {
      summary: summaryFor("Artikel & Berita", db.articles || [], "doc"),
      rows: db.articles || [],
      user: db.user,
    });
    return;
  }

  const commercialAdminRoutes = {
    "/api/admin/opportunities": ["Peluang", "opportunities", "chart"],
    "/api/admin/utilization-submissions": ["Pengajuan", "utilizationSubmissions", "doc"],
    "/api/admin/partnerships": ["Kerja Sama", "partnerships", "handshake"],
    "/api/admin/contracts": ["Kontrak", "contracts", "folder"],
    "/api/admin/payments": ["Pembayaran", "payments", "money"],
  };

  if (commercialAdminRoutes[url.pathname] && request.method === "GET") {
    const [label, key, icon] = commercialAdminRoutes[url.pathname];
    sendJson(response, 200, {
      summary: summaryFor(label, db[key], icon),
      rows: db[key],
      user: db.user,
    });
    return;
  }

  const financeAdminRoutes = {
    "/api/admin/asset-appraisals": ["Penilaian", "assetAppraisals", "calculator"],
    "/api/admin/potential-values": ["Nilai Potensi", "potentialValues", "growth"],
    "/api/admin/pad-revenues": ["Pendapatan PAD", "padRevenues", "receipt"],
    "/api/admin/financial-reports": ["Laporan Keuangan", "financialReports", "doc"],
  };

  if (financeAdminRoutes[url.pathname] && request.method === "GET") {
    const [label, key, icon] = financeAdminRoutes[url.pathname];
    sendJson(response, 200, {
      summary: summaryFor(label, db[key], icon),
      rows: db[key],
      user: db.user,
    });
    return;
  }

  const monitoringAdminRoutes = {
    "/api/admin/asset-monitorings": ["Monitoring Aset", "assetMonitorings", "monitor"],
    "/api/admin/statistical-reports": ["Statistik", "statisticalReports", "chart"],
  };

  if (monitoringAdminRoutes[url.pathname] && request.method === "GET") {
    const [label, key, icon] = monitoringAdminRoutes[url.pathname];
    sendJson(response, 200, {
      summary: summaryFor(label, db[key], icon),
      rows: db[key],
      user: db.user,
    });
    return;
  }

  if (url.pathname === "/api/admin/statistics-dashboard" && request.method === "GET") {
    sendJson(response, 200, {
      user: db.user,
      opdAssets: [
        { label: "Dinas Pendidikan", value: 2150 },
        { label: "Dinas PUPR", value: 1980 },
        { label: "Dinas Kesehatan", value: 1450 },
        { label: "Dinas Pertanian", value: 1240 },
        { label: "Dinas Perhubungan", value: 890 },
        { label: "Dinas Perindag", value: 780 },
        { label: "OPD Lainnya", value: 1726 }
      ],
      assetComposition: [
        { label: "Tanah", value: 56, color: "#1d5fbf" },
        { label: "Bangunan", value: 24, color: "#2f80ed" },
        { label: "Jalan", value: 10, color: "#f2c94c" },
        { label: "Irigasi", value: 5, color: "#f2994a" },
        { label: "Lainnya", value: 3, color: "#27ae60" }
      ],
      certification: [
        { label: "Bersertifikat", value: 79, count: 9850, color: "#27ae60" },
        { label: "Belum Sertifikat", value: 21, count: 2636, color: "#e45d48" }
      ],
      certificationTrend: [
        { year: "2022", certified: 5120, uncertified: 4800 },
        { year: "2023", certified: 6380, uncertified: 4210 },
        { year: "2024", certified: 7420, uncertified: 3410 },
        { year: "2025", certified: 8710, uncertified: 2850 },
        { year: "2026", certified: 9850, uncertified: 2636 }
      ],
      districtSpread: [
        { label: "Selong", value: 617, x: 48, y: 44 },
        { label: "Sakra", value: 421, x: 67, y: 52 },
        { label: "Terara", value: 389, x: 38, y: 48 },
        { label: "Pringgabaya", value: 512, x: 59, y: 32 },
        { label: "Sembalun", value: 319, x: 50, y: 22 },
        { label: "Jerowaru", value: 335, x: 72, y: 67 },
        { label: "Aikmel", value: 430, x: 42, y: 34 },
        { label: "Labuhan Haji", value: 391, x: 77, y: 43 },
        { label: "Sikur", value: 312, x: 51, y: 57 }
      ],
      opdValues: [
        { label: "Dinas PUPR", value: 2.35 },
        { label: "Dinas Pendidikan", value: 1.68 },
        { label: "Dinas Kesehatan", value: 1.15 },
        { label: "Dinas Pertanian", value: 0.85 },
        { label: "Dinas Perindag", value: 0.62 },
        { label: "Dinas Perhubungan", value: 0.41 },
        { label: "OPD Lainnya", value: 0.79 }
      ],
      kpis: [
        { label: "Total Aset", value: "12.486" },
        { label: "Total Nilai Aset", value: "Rp 7,85 T" },
        { label: "Bersertifikat", value: "9.850" },
        { label: "Belum Sertifikat", value: "2.636" },
        { label: "Sengketa", value: "142" },
        { label: "Siap Komersial", value: "184" }
      ]
    });
    return;
  }

  if (url.pathname === "/api/admin/utilization-report" && request.method === "GET") {
    const assets = db.assets || [];
    const contracts = db.contracts || [];
    const payments = db.payments || [];
    const totalContractValue = contracts.reduce((sum, row) => sum + Number(row.contractValue || 0), 0);
    const totalPad = payments.reduce((sum, row) => sum + Number(row.amount || 0), 0) || db.padRevenues.reduce((sum, row) => sum + Number(row.realization || 0), 0);
    const activeContracts = contracts.filter((row) => row.status === "Aktif").length;
    const expiringSoon = contracts.filter((row) => row.status === "Aktif").slice(0, Math.min(contracts.length, 18)).length;
    const schemes = [...new Set(assets.map((asset) => asset.scheme || "Lainnya"))];
    const opdOptions = [...new Set(assets.map((asset) => asset.opdName).filter(Boolean))];
    const monthlyRevenue = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"].map((month, index) => ({
      month,
      value: Math.round((totalPad / 12) * (0.72 + index * 0.04)),
    }));
    const revenueByType = schemes.map((scheme) => {
      const related = assets.filter((asset) => (asset.scheme || "Lainnya") === scheme);
      const value = related.reduce((sum, asset) => sum + Number(asset.valuePerYear || 0), 0);
      return { label: scheme, value, count: related.length };
    }).filter((row) => row.value > 0);
    const revenueByOpd = opdOptions.map((opd) => {
      const value = assets.filter((asset) => asset.opdName === opd).reduce((sum, asset) => sum + Number(asset.valuePerYear || 0), 0);
      return { label: opd, value };
    }).sort((a, b) => b.value - a.value).slice(0, 7);
    const details = contracts.map((contract, index) => {
      const asset = assets.find((row) => row.name === contract.asset) || assets[index % Math.max(assets.length, 1)] || {};
      const payment = payments.find((row) => row.asset === contract.asset) || {};
      return {
        id: contract.id,
        asset: contract.asset || asset.name || contract.name || "-",
        location: asset.district ? `${asset.district}, Lombok Timur` : asset.location || "-",
        opd: asset.opdName || "-",
        type: asset.scheme || "-",
        partner: contract.partner || "-",
        number: contract.number || "-",
        startDate: contract.signedDate || "-",
        endDate: contract.endDate || "-",
        contractValue: Number(contract.contractValue || 0),
        yearlyRevenue: Number(payment.amount || asset.valuePerYear || 0),
        status: contract.status || "Aktif",
      };
    });
    const summary = [
      { id: "assets", label: "TOTAL ASET DIMANFAATKAN", value: String(assets.length), helper: "Aset", icon: "building", tone: "blue" },
      { id: "pad", label: "TOTAL PENDAPATAN (PAD)", value: formatRupiahShort(totalPad), helper: "Tahun berjalan", icon: "growth", tone: "green" },
      { id: "contract-value", label: "NILAI KONTRAK", value: formatRupiahShort(totalContractValue), helper: "Total nilai kontrak", icon: "handshake", tone: "orange" },
      { id: "active", label: "PERJANJIAN AKTIF", value: String(activeContracts), helper: "Perjanjian", icon: "hourglass", tone: "purple" },
      { id: "expiring", label: "AKAN BERAKHIR", value: String(expiringSoon), helper: "<= 90 hari", icon: "bell", tone: "pink" },
    ];
    const reportSummary = [
      ["Total Aset Dimanfaatkan", `${assets.length} Aset`],
      ["Total Pendapatan (PAD)", formatRupiahShort(totalPad)],
      ["Nilai Kontrak", formatRupiahShort(totalContractValue)],
      ["Perjanjian Aktif", `${activeContracts} Perjanjian`],
      ["Akan Berakhir", `${expiringSoon} Perjanjian`],
      ...revenueByType.map((row) => [row.label, `${row.count} Aset`]),
    ];
    sendJson(response, 200, {
      user: db.user,
      period: "01 Jan 2026 - 18 Jul 2026",
      opdOptions,
      schemeOptions: schemes,
      statusOptions: ["Aktif", "Selesai", "Dibatalkan"],
      summary,
      revenueByType,
      monthlyRevenue,
      revenueByOpd,
      details,
      reportSummary,
    });
    return;
  }

  if (url.pathname === "/api/public/home" && request.method === "GET") {
    if (syncLocationsFromAssets(db)) await writeDb(db);
    sendJson(response, 200, { ...buildPublicHomeData(db), appInfo: { ...defaultAppInfo, ...(db.appInfo || {}) } });
    return;
  }

  if (url.pathname === "/api/assets" && request.method === "GET") {
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q")?.toLowerCase();
    const assets = db.assets.filter((asset) => {
      const matchesCategory = !category || asset.category === category;
      const matchesStatus = !status || asset.status === status;
      const matchesQuery = !q || `${asset.name} ${asset.location} ${asset.scheme} ${asset.area || ""} ${asset.potential || ""}`.toLowerCase().includes(q);
      return matchesCategory && matchesStatus && matchesQuery;
    });
    sendJson(response, 200, { data: assets, total: assets.length });
    return;
  }

  if (url.pathname === "/api/assets" && request.method === "POST") {
    const payload = await readBody(request);
    if (!payload.idPemda || !payload.name || !payload.opdName || !payload.category || !payload.location || !payload.scheme) {
      sendJson(response, 400, { error: "Idpemda, nama aset, nama OPD, kategori, lokasi, dan skema aset wajib diisi" });
      return;
    }
    const locationRows = await getLocations() || db.locations;
    const selectedLocation = locationRows.find((location) => location.name === payload.location);
    const nextId = Math.max(0, ...db.assets.map((asset) => asset.id)) + 1;
    const photos = Array.isArray(payload.photos) && payload.photos.length ? payload.photos : (payload.photoUrl ? [payload.photoUrl] : []);
    const asset = {
      id: nextId,
      status: "Tersedia",
      valuePerYear: 0,
      ...payload,
      photos,
      photoUrl: payload.photoUrl || (photos.length ? photos[0] : ""),
      district: payload.district || selectedLocation?.district || "",
      address: payload.address || selectedLocation?.address || selectedLocation?.description || "",
      lat: payload.lat ?? selectedLocation?.lat ?? null,
      lng: payload.lng ?? selectedLocation?.lng ?? null,
    };
    db.assets.push(asset);
    syncLocationFromAsset(db, asset);
    await writeDb(db);
    sendJson(response, 201, asset);
    return;
  }

  if (url.pathname.startsWith("/api/assets/") && request.method === "PUT") {
    const id = getId(url.pathname);
    const index = db.assets.findIndex((asset) => asset.id === id);
    if (index === -1) return notFound(response);
    const payload = await readBody(request);
    const previousAsset = { ...db.assets[index] };
    const locationRows = await getLocations() || db.locations;
    const selectedLocation = locationRows.find((location) => location.name === payload.location);
    const photos = Array.isArray(payload.photos) ? payload.photos : (db.assets[index].photos || (payload.photoUrl ? [payload.photoUrl] : []));
    db.assets[index] = {
      ...db.assets[index],
      ...payload,
      photos,
      photoUrl: payload.photoUrl || (photos.length ? photos[0] : db.assets[index].photoUrl || ""),
      district: payload.district || selectedLocation?.district || db.assets[index].district || "",
      address: payload.address || selectedLocation?.address || selectedLocation?.description || db.assets[index].address || "",
      lat: payload.lat ?? selectedLocation?.lat ?? db.assets[index].lat ?? null,
      lng: payload.lng ?? selectedLocation?.lng ?? db.assets[index].lng ?? null,
      id,
    };
    if (previousAsset.idPemda !== db.assets[index].idPemda) removeLocationForAsset(db, previousAsset);
    syncLocationFromAsset(db, db.assets[index]);
    await writeDb(db);
    sendJson(response, 200, db.assets[index]);
    return;
  }

  if (url.pathname.startsWith("/api/assets/") && request.method === "DELETE") {
    const id = getId(url.pathname);
    const deletedAsset = db.assets.find((asset) => asset.id === id);
    const initialLength = db.assets.length;
    db.assets = db.assets.filter((asset) => asset.id !== id);
    if (db.assets.length === initialLength) return notFound(response);
    removeLocationForAsset(db, deletedAsset);
    await writeDb(db);
    sendJson(response, 200, { deleted: true, id });
    return;
  }

  if (url.pathname === "/api/categories" && request.method === "GET") {
    sendJson(response, 200, { data: db.categories });
    return;
  }

  if (url.pathname === "/api/categories" && request.method === "POST") {
    const payload = await readBody(request);
    const name = String(payload.name || "").trim();
    if (!name) {
      sendJson(response, 400, { error: "Nama kategori wajib diisi" });
      return;
    }
    if (db.categories.some((category) => category.toLowerCase() === name.toLowerCase())) {
      sendJson(response, 409, { error: "Kategori sudah ada" });
      return;
    }
    db.categories.push(name);
    await writeDb(db);
    sendJson(response, 201, {
      id: db.categories.length,
      name,
      code: name.toUpperCase().replace(/\s+/g, "-"),
      description: payload.description || `Kategori aset ${name} milik Pemerintah Kabupaten Lombok Timur`,
      assetCount: 0,
      totalValue: 0,
      status: payload.status || "Aktif",
    });
    return;
  }

  if (url.pathname.startsWith("/api/categories/") && request.method === "PUT") {
    const id = getId(url.pathname);
    const index = id - 1;
    if (!db.categories[index]) return notFound(response);
    const payload = await readBody(request);
    const oldName = db.categories[index];
    const name = String(payload.name || "").trim();
    if (!name) {
      sendJson(response, 400, { error: "Nama kategori wajib diisi" });
      return;
    }
    if (db.categories.some((category, categoryIndex) => categoryIndex !== index && category.toLowerCase() === name.toLowerCase())) {
      sendJson(response, 409, { error: "Kategori sudah ada" });
      return;
    }
    db.categories[index] = name;
    const categoryCollections = [db.assets, db.opportunities, db.potentialValues];
    categoryCollections.forEach((rows) => {
      rows.forEach((row) => {
        if (row.category === oldName) row.category = name;
      });
    });
    await writeDb(db);
    const relatedAssets = db.assets.filter((asset) => asset.category === name);
    const totalValue = relatedAssets.reduce((sum, asset) => sum + Number(asset.valuePerYear || 0), 0);
    sendJson(response, 200, {
      id,
      name,
      code: name.toUpperCase().replace(/\s+/g, "-"),
      description: payload.description || `Kategori aset ${name} milik Pemerintah Kabupaten Lombok Timur`,
      assetCount: relatedAssets.length,
      totalValue,
      status: payload.status || "Aktif",
    });
    return;
  }

  if (url.pathname.startsWith("/api/categories/") && request.method === "DELETE") {
    const id = getId(url.pathname);
    const index = id - 1;
    if (!db.categories[index]) return notFound(response);
    const name = db.categories[index];
    const relatedAssets = db.assets.filter((asset) => asset.category === name);
    const replacement = String(url.searchParams.get("replaceWith") || "").trim();
    if (relatedAssets.length && !replacement) {
      sendJson(response, 409, {
        error: "Kategori masih digunakan oleh data aset",
        requiresReplacement: true,
        category: name,
        assetCount: relatedAssets.length,
        replacements: db.categories.filter((category) => category !== name),
      });
      return;
    }
    if (relatedAssets.length && replacement) {
      if (replacement === name || !db.categories.includes(replacement)) {
        sendJson(response, 400, { error: "Pilih kategori pengganti yang valid" });
        return;
      }
      const categoryCollections = [db.assets, db.opportunities, db.potentialValues];
      categoryCollections.forEach((rows) => {
        rows.forEach((row) => {
          if (row.category === name) row.category = replacement;
        });
      });
    }
    db.categories.splice(index, 1);
    await writeDb(db);
    sendJson(response, 200, { deleted: true, id, movedAssets: relatedAssets.length, replacement: replacement || null });
    return;
  }

  const collectionRoutes = {
    "/api/schemes": "schemes",
    "/api/users": "users",
    "/api/roles": "roles",
    "/api/opportunities": "opportunities",
    "/api/utilization-submissions": "utilizationSubmissions",
    "/api/partnerships": "partnerships",
    "/api/contracts": "contracts",
    "/api/payments": "payments",
    "/api/asset-appraisals": "assetAppraisals",
    "/api/potential-values": "potentialValues",
    "/api/pad-revenues": "padRevenues",
    "/api/financial-reports": "financialReports",
    "/api/asset-monitorings": "assetMonitorings",
    "/api/statistical-reports": "statisticalReports",
    "/api/articles": "articles",
  };

  if (collectionRoutes[url.pathname] && request.method === "POST") {
    const key = collectionRoutes[url.pathname];
    const payload = await readBody(request);
    if (key === "articles" && !payload.name) payload.name = payload.title || "Artikel Baru";
    if (key === "contracts" && !payload.name) payload.name = payload.number || "Kontrak Baru";
    if (key === "payments" && !payload.name) payload.name = payload.invoice || "Pembayaran Baru";
    if (!payload.name) {
      sendJson(response, 400, { error: "Nama wajib diisi" });
      return;
    }
    if (key === "users") {
      if (!payload.username || !payload.password) {
        sendJson(response, 400, { error: "Username dan password wajib diisi" });
        return;
      }
      if (db.users.some((user) => user.username?.toLowerCase() === String(payload.username).toLowerCase())) {
        sendJson(response, 409, { error: "Username sudah digunakan" });
        return;
      }
    }
    const nextId = Math.max(0, ...db[key].map((row) => row.id)) + 1;
    const row = { id: nextId, status: "Aktif", ...payload };
    db[key].push(row);
    await writeDb(db);
    sendJson(response, 201, row);
    return;
  }

  for (const [route, key] of Object.entries(collectionRoutes)) {
    if (url.pathname.startsWith(`${route}/`) && request.method === "PUT") {
      const id = getId(url.pathname);
      const index = db[key].findIndex((row) => row.id === id);
      if (index === -1) return notFound(response);
      const payload = await readBody(request);
      if (key === "users") {
        if (!payload.username || !payload.password) {
          sendJson(response, 400, { error: "Username dan password wajib diisi" });
          return;
        }
        if (db.users.some((user) => user.id !== id && user.username?.toLowerCase() === String(payload.username).toLowerCase())) {
          sendJson(response, 409, { error: "Username sudah digunakan" });
          return;
        }
      }
      db[key][index] = { ...db[key][index], ...payload, id };
      await writeDb(db);
      sendJson(response, 200, db[key][index]);
      return;
    }

    if (url.pathname.startsWith(`${route}/`) && request.method === "DELETE") {
      const id = getId(url.pathname);
      const initialLength = db[key].length;
      db[key] = db[key].filter((row) => row.id !== id);
      if (db[key].length === initialLength) return notFound(response);
      await writeDb(db);
      sendJson(response, 200, { deleted: true, id });
      return;
    }
  }

  if (url.pathname === "/api/locations" && request.method === "GET") {
    const district = url.searchParams.get("district");
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q")?.toLowerCase();
    const postgresLocations = await getLocations({ district, status, q });
    const sourceLocations = postgresLocations || db.locations;
    const locations = sourceLocations.filter((location) => {
      const matchesDistrict = !district || location.district === district;
      const matchesStatus = !status || location.status === status;
      const matchesQuery = !q || `${location.name} ${location.district} ${location.address || ""} ${location.description}`.toLowerCase().includes(q);
      return matchesDistrict && matchesStatus && matchesQuery;
    });
    sendJson(response, 200, { data: locations, total: locations.length });
    return;
  }

  if (url.pathname === "/api/locations" && request.method === "POST") {
    const payload = await readBody(request);
    if (!payload.name || !payload.district || !payload.address || !payload.description) {
      sendJson(response, 400, { error: "Nama lokasi, kecamatan, alamat lengkap, dan deskripsi wajib diisi" });
      return;
    }
    const postgresLocation = await createLocation(payload);
    if (postgresLocation) {
      sendJson(response, 201, postgresLocation);
      return;
    }
    const nextId = Math.max(0, ...db.locations.map((location) => location.id)) + 1;
    const photos = Array.isArray(payload.photos) && payload.photos.length ? payload.photos : (payload.photoUrl ? [payload.photoUrl] : []);
    const location = { id: nextId, assetCount: 0, strategic: false, status: "Aktif", ...payload, photos, photoUrl: payload.photoUrl || (photos.length ? photos[0] : "") };
    db.locations.push(location);
    await writeDb(db);
    sendJson(response, 201, location);
    return;
  }

  if (url.pathname.startsWith("/api/asset-locations/") && request.method === "PUT") {
    const id = getId(url.pathname);
    const index = db.assets.findIndex((asset) => asset.id === id);
    if (index === -1) return notFound(response);
    const payload = await readBody(request);
    const previousAsset = { ...db.assets[index] };
    const assetName = String(payload.name || payload.assetName || db.assets[index].name).trim();
    if (!assetName || !payload.district || !payload.address) {
      sendJson(response, 400, { error: "Nama aset, kecamatan, dan alamat lengkap wajib diisi" });
      return;
    }
    db.assets[index] = {
      ...db.assets[index],
      name: assetName,
      idPemda: payload.idPemda || db.assets[index].idPemda,
      location: payload.locationName || payload.location || db.assets[index].location,
      district: payload.district,
      address: payload.address,
      lat: payload.lat ?? null,
      lng: payload.lng ?? null,
      photoUrl: payload.photoUrl || (Array.isArray(payload.photos) && payload.photos[0]) || db.assets[index].photoUrl || "",
      photos: Array.isArray(payload.photos) ? payload.photos : (db.assets[index].photos || (payload.photoUrl ? [payload.photoUrl] : [])),
      status: payload.status || db.assets[index].status,
    };
    if (previousAsset.idPemda !== db.assets[index].idPemda) removeLocationForAsset(db, previousAsset);
    syncLocationFromAsset(db, db.assets[index]);
    await writeDb(db);
    const updated = buildAssetLocations(db, await getLocations() || db.locations).find((location) => location.id === id);
    sendJson(response, 200, updated);
    return;
  }

  if (url.pathname.startsWith("/api/asset-locations/") && request.method === "DELETE") {
    const id = getId(url.pathname);
    const deletedAsset = db.assets.find((asset) => asset.id === id);
    const initialLength = db.assets.length;
    db.assets = db.assets.filter((asset) => asset.id !== id);
    if (db.assets.length === initialLength) return notFound(response);
    removeLocationForAsset(db, deletedAsset);
    await writeDb(db);
    sendJson(response, 200, { deleted: true, id, removedAssets: initialLength - db.assets.length });
    return;
  }

  if (url.pathname.startsWith("/api/locations/") && request.method === "PUT") {
    const id = getId(url.pathname);
    const payload = await readBody(request);
    let updatedLocation = null;
    if (hasPostgres()) {
      updatedLocation = await updateLocation(id, payload);
    }
    if (!updatedLocation) {
      const index = db.locations.findIndex((location) => location.id === id);
      if (index === -1) return notFound(response);
      const photos = Array.isArray(payload.photos) ? payload.photos : (db.locations[index].photos || (payload.photoUrl ? [payload.photoUrl] : []));
      db.locations[index] = { ...db.locations[index], ...payload, photos, photoUrl: payload.photoUrl || (photos.length ? photos[0] : db.locations[index].photoUrl || ""), id };
      await writeDb(db);
      updatedLocation = db.locations[index];
    }
    sendJson(response, 200, updatedLocation);
    return;
  }

  if (url.pathname.startsWith("/api/locations/") && request.method === "DELETE") {
    const id = getId(url.pathname);
    let deleted = false;
    if (hasPostgres()) {
      deleted = await deleteLocation(id);
    }
    const initialLength = db.locations.length;
    db.locations = db.locations.filter((location) => location.id !== id);
    if (db.locations.length < initialLength) {
      await writeDb(db);
      deleted = true;
    }
    if (!deleted) return notFound(response);
    sendJson(response, 200, { deleted: true, id });
    return;
  }

  if (url.pathname === "/api/submissions" && request.method === "GET") {
    sendJson(response, 200, { data: db.submissions, total: db.submissions.length });
    return;
  }

  notFound(response);
}

async function serveStatic(request, response, url) {
  const cleanPath = url.pathname.replace(/^\/+/, "");
  const filePath = cleanPath ? path.join(distDir, cleanPath) : path.join(distDir, "index.html");
  const safePath = path.normalize(filePath);

  const isDistFile = safePath.startsWith(distDir) && existsSync(safePath) && statSync(safePath).isFile();

  if (isDistFile) {
    const ext = path.extname(safePath).toLowerCase();
    response.writeHead(200, { "content-type": mimeTypes[ext] || "application/octet-stream" });
    response.end(await readFile(safePath));
    return;
  }

  // SPA Fallback: for non-API client routes, serve index.html
  const fallback = path.join(distDir, "index.html");
  if (existsSync(fallback)) {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(await readFile(fallback));
    return;
  }

  notFound(response);
}

if (process.env.DATABASE_URL) {
  checkPostgresConnection().then((connected) => {
    if (connected) {
      console.log("[Database] Terhubung ke PostgreSQL.");
      migratePostgres()
        .then(() => console.log("[Database] Migrasi PostgreSQL siap digunakan."))
        .catch((error) => console.warn("[Database] Migrasi PostgreSQL dilewati:", error?.message || error));
    } else {
      console.log("[Database] PostgreSQL tidak aktif/belum berjalan. Menggunakan database lokal (server/data.json).");
    }
  });
} else {
  console.log("[Database] Menggunakan penyimpanan data lokal (server/data.json).");
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }
    await serveStatic(request, response, url);
  } catch (error) {
    sendJson(response, 500, { error: "Terjadi kesalahan server", detail: error.message });
  }
}).listen(port, host, () => {
  console.log(`PETA API berjalan di http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${port}`);
});

