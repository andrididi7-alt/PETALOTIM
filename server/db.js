import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const { Pool } = pg;

async function loadEnvFile() {
  try {
    const env = await readFile(path.join(rootDir, ".env"), "utf8");
    env.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) process.env[key] = valueParts.join("=").trim();
    });
  } catch {
    // The .env file is optional.
  }
}

await loadEnvFile();

let pool = null;
let postgresConnected = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 2000,
    });
    pool.on("error", (err) => {
      console.warn("[PostgreSQL] Pool error:", err.message);
      postgresConnected = false;
    });
  } catch (err) {
    console.warn("[PostgreSQL] Inisialisasi pool gagal:", err.message);
    pool = null;
  }
}

export async function checkPostgresConnection() {
  if (!pool) {
    postgresConnected = false;
    return false;
  }
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    postgresConnected = true;
    return true;
  } catch {
    postgresConnected = false;
    return false;
  }
}

export function hasPostgres() {
  return Boolean(pool && postgresConnected);
}

export async function migratePostgres() {
  if (!pool) return false;
  const connected = await checkPostgresConnection();
  if (!connected) return false;
  try {
    const schema = await readFile(path.join(rootDir, "database", "schema.sql"), "utf8");
    const seed = await readFile(path.join(rootDir, "database", "seed.sql"), "utf8");
    await pool.query(schema);
    await pool.query(seed);
    postgresConnected = true;
    return true;
  } catch (err) {
    postgresConnected = false;
    throw err;
  }
}

function mapLocation(row) {
  return {
    id: row.id,
    idPemda: row.idpemda || "",
    name: row.name,
    district: row.district,
    address: row.address,
    description: row.description,
    assetCount: Number(row.asset_count),
    strategic: row.strategic,
    status: row.status,
    lat: row.lat === null ? null : Number(row.lat),
    lng: row.lng === null ? null : Number(row.lng),
    photoUrl: row.photo_url || "",
  };
}

function nullableNumber(value) {
  return value === "" || value === undefined || value === null ? null : Number(value);
}

export async function getAdminUser(username) {
  if (!hasPostgres()) return null;
  try {
    const result = await pool.query(
      "SELECT username, password_text, name, role, notifications FROM admin_users WHERE username = $1 LIMIT 1",
      [username]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.warn("[PostgreSQL] getAdminUser gagal, fallback ke data lokal:", error.message);
    postgresConnected = false;
    return null;
  }
}

export async function getLocations(filters = {}) {
  if (!hasPostgres()) return null;
  try {
    const conditions = [];
    const values = [];

    if (filters.district) {
      values.push(filters.district);
      conditions.push(`district = $${values.length}`);
    }

    if (filters.status) {
      values.push(filters.status);
      conditions.push(`status = $${values.length}`);
    }

    if (filters.q) {
      values.push(`%${filters.q.toLowerCase()}%`);
      conditions.push(`LOWER(name || ' ' || district || ' ' || COALESCE(address, '') || ' ' || description) LIKE $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT id, idpemda, name, district, address, description, asset_count, strategic, status, lat, lng, photo_url
       FROM locations
       ${where}
       ORDER BY id ASC`,
      values
    );
    return result.rows.map(mapLocation);
  } catch (error) {
    console.warn("[PostgreSQL] getLocations gagal, fallback ke data lokal:", error.message);
    postgresConnected = false;
    return null;
  }
}

export async function createLocation(payload) {
  if (!hasPostgres()) return null;
  try {
    const result = await pool.query(
      `INSERT INTO locations (idpemda, name, district, address, description, asset_count, strategic, status, lat, lng, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, idpemda, name, district, address, description, asset_count, strategic, status, lat, lng, photo_url`,
      [
        payload.idPemda || payload.idpemda || null,
        payload.name,
        payload.district,
        payload.address,
        payload.description,
        Number(payload.assetCount || 0),
        Boolean(payload.strategic),
        payload.status || "Aktif",
        nullableNumber(payload.lat),
        nullableNumber(payload.lng),
        payload.photoUrl || "",
      ]
    );
    return mapLocation(result.rows[0]);
  } catch (error) {
    console.warn("[PostgreSQL] createLocation gagal, fallback ke data lokal:", error.message);
    postgresConnected = false;
    return null;
  }
}

export async function updateLocation(id, payload) {
  if (!hasPostgres()) return null;
  try {
    const existing = await pool.query("SELECT * FROM locations WHERE id = $1", [id]);
    if (!existing.rows.length) return null;
    const current = mapLocation(existing.rows[0]);
    const next = { ...current, ...payload };
    const result = await pool.query(
      `UPDATE locations
       SET idpemda = $1, name = $2, district = $3, address = $4, description = $5, asset_count = $6, strategic = $7, status = $8, lat = $9, lng = $10, photo_url = $11, updated_at = NOW()
       WHERE id = $12
       RETURNING id, idpemda, name, district, address, description, asset_count, strategic, status, lat, lng, photo_url`,
      [
        next.idPemda || next.idpemda || null,
        next.name,
        next.district,
        next.address,
        next.description,
        Number(next.assetCount || 0),
        Boolean(next.strategic),
        next.status || "Aktif",
        nullableNumber(next.lat),
        nullableNumber(next.lng),
        next.photoUrl || "",
        id,
      ]
    );
    return mapLocation(result.rows[0]);
  } catch (error) {
    console.warn("[PostgreSQL] updateLocation gagal, fallback ke data lokal:", error.message);
    postgresConnected = false;
    return null;
  }
}

export async function deleteLocation(id) {
  if (!hasPostgres()) return null;
  try {
    const result = await pool.query("DELETE FROM locations WHERE id = $1", [id]);
    return result.rowCount > 0;
  } catch (error) {
    console.warn("[PostgreSQL] deleteLocation gagal, fallback ke data lokal:", error.message);
    postgresConnected = false;
    return null;
  }
}
