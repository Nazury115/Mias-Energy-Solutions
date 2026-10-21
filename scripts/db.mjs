// Local database maintenance (run from the project folder):
//   node scripts/db.mjs migrate              apply migrations (the website also does this on first use)
//   node scripts/db.mjs delete MES-26-XXXXX  delete an inquiry and its notifications (privacy requests)
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

const dir = path.resolve(process.env.MIAS_DB_DIR ?? path.join(process.cwd(), ".data", "pglite"));
const lock = path.join(path.dirname(dir), "pglite.lock");

// PGlite allows one process at a time, so refuse while the website holds the database.
if (existsSync(lock)) {
  const pid = Number(readFileSync(lock, "utf8"));
  let running = false;
  try { process.kill(pid, 0); running = true; } catch (error) { running = error.code === "EPERM"; }
  if (running) {
    console.error(`The website (process ${pid}) is using the database. Stop it first, or delete inquiries from /dev/inbox.`);
    process.exit(1);
  }
}

const [command, reference] = process.argv.slice(2);
if (command !== "migrate" && !(command === "delete" && reference)) {
  console.error("Usage: node scripts/db.mjs migrate | delete <reference>");
  process.exit(1);
}
mkdirSync(dir, { recursive: true }); // a fresh copy has no .data folder yet
const client = await PGlite.create(dir);
try {
  if (command === "migrate") {
    await migrate(drizzle({ client }), { migrationsFolder: path.join(process.cwd(), "drizzle") });
    console.log("Database is up to date.");
  } else {
    const result = await client.query("delete from inquiries where reference = $1", [reference.trim().toUpperCase()]);
    console.log(result.affectedRows ? `Deleted ${reference} and its notifications.` : `No inquiry with reference ${reference}.`);
  }
} finally {
  await client.close();
}
