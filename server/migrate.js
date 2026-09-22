import { checkPostgresConnection, migratePostgres } from "./db.js";

try {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL belum diisi. Migrasi PostgreSQL dilewati.");
    console.log("Aplikasi tetap berjalan normal menggunakan data JSON lokal (server/data.json).");
    process.exit(0);
  }

  const isConnected = await checkPostgresConnection();
  if (!isConnected) {
    console.warn("Koneksi ke PostgreSQL gagal atau server database belum berjalan di localhost:5432.");
    console.log("Aplikasi tetap berjalan normal menggunakan data JSON lokal (server/data.json).");
    process.exit(0);
  }

  const migrated = await migratePostgres();
  if (migrated) {
    console.log("Migrasi dan seed PostgreSQL selesai dengan sukses.");
  }
} catch (error) {
  console.error("Migrasi PostgreSQL gagal:", error?.message || error);
  process.exit(1);
}
