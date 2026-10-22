// Local database maintenance (run from the project folder):
//   node scripts/db.mjs migrate              apply migrations (the website also does this on first use)
//   node scripts/db.mjs delete MES-26-XXXXX  delete an inquiry and its notifications (privacy requests)
//   node scripts/db.mjs create-owner --email you@example.com --name "Your Name"
//                                            print a single-use link that creates an Owner account (spec 007, INV-04)
import { createHash, randomBytes } from "node:crypto";
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
const option = name => {
  const index = process.argv.indexOf(`--${name}`);
  return index > 0 ? process.argv[index + 1]?.trim() : undefined;
};
const ownerEmail = option("email")?.toLowerCase(), ownerName = option("name");
if (command !== "migrate" && !(command === "delete" && reference) && !(command === "create-owner" && ownerEmail && ownerName)) {
  console.error('Usage: node scripts/db.mjs migrate | delete <reference> | create-owner --email <address> --name "<name>"');
  process.exit(1);
}
if (command === "create-owner" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ownerEmail)) {
  console.error("That email address doesn't look right.");
  process.exit(1);
}
mkdirSync(dir, { recursive: true }); // a fresh copy has no .data folder yet
const client = await PGlite.create(dir);
try {
  if (command === "migrate" || command === "create-owner") {
    await migrate(drizzle({ client }), { migrationsFolder: path.join(process.cwd(), "drizzle") });
    if (command === "migrate") console.log("Database is up to date.");
  }
  if (command === "create-owner") {
    const existing = await client.query('select role from "user" where email = $1', [ownerEmail]);
    if (existing.rows.length) {
      console.error(`An account for ${ownerEmail} already exists (role: ${existing.rows[0].role}).`);
      process.exitCode = 1;
    } else {
      // Same scheme as the website: only a SHA-256 hash of the token is stored; the link holds the token.
      const token = randomBytes(32).toString("base64url");
      await client.query(
        "insert into invitations (email, name, role, token_hash, expires_at) values ($1, $2, 'owner', $3, now() + interval '24 hours')",
        [ownerEmail, ownerName, createHash("sha256").update(token).digest("hex")],
      );
      const base = process.env.MIAS_SITE_URL ?? "http://127.0.0.1:3000";
      console.log(`Owner invitation for ${ownerName} <${ownerEmail}> (single use, valid 24 hours):`);
      console.log(`${base}/invite?token=${token}`);
      console.log("Start the website, open the link and choose a password.");
    }
  } else if (command === "delete") {
    const result = await client.query("delete from inquiries where reference = $1", [reference.trim().toUpperCase()]);
    console.log(result.affectedRows ? `Deleted ${reference} and its notifications.` : `No inquiry with reference ${reference}.`);
  }
} finally {
  await client.close();
}
