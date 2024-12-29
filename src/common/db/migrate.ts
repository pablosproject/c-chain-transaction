import { Pool } from "pg";
import { migrate } from "postgres-migrations";
import { env } from "../lib/env";

async function runMigrations() {
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });

  try {
    await migrate({ client: pool }, "./src/common/db/migrations");
    console.log("Migrations completed");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

runMigrations();
