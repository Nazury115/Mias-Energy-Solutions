import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";

export type Database = PgliteDatabase<typeof schema>;

// Local development database: PostgreSQL (PGlite) stored in .data/pglite unless MIAS_DB_DIR says otherwise.
// At launch this module switches to a hosted PostgreSQL connection; the rest of the app is unchanged.
export const databaseDir = () => path.resolve(process.env.MIAS_DB_DIR ?? path.join(process.cwd(), ".data", "pglite"));
export const lockFile = () => path.join(path.dirname(databaseDir()), "pglite.lock");

const store = globalThis as typeof globalThis & { miasDatabase?: Promise<Database> };

async function open(): Promise<Database> {
  const dir = databaseDir();
  mkdirSync(dir, { recursive: true });
  // PGlite allows one process at a time; the lock lets scripts/db.mjs refuse to run while the website holds it.
  writeFileSync(lockFile(), String(process.pid));
  process.once("exit", () => {
    try { if (readFileSync(lockFile(), "utf8") === String(process.pid)) rmSync(lockFile()); } catch { /* already gone */ }
  });
  const client = await PGlite.create(dir);
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  return db;
}

/** One shared connection per server process, surviving development hot reloads. */
export function getDb(): Promise<Database> {
  store.miasDatabase ??= open().catch(error => {
    store.miasDatabase = undefined;
    throw error;
  });
  return store.miasDatabase;
}
