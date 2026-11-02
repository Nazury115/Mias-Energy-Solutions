import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Recreate the previous release in memory, including records that cannot exist on
// a fresh-install test, then apply the actual generated migration.
const db = await PGlite.create();
try {
  const journal = JSON.parse(await readFile("drizzle/meta/_journal.json", "utf8"));
  async function migrate(entry) {
    await db.exec(await readFile("drizzle/" + entry.tag + ".sql", "utf8"));
  }
  for (const entry of journal.entries.slice(0, 3)) await migrate(entry);
  await db.exec(`
    insert into "user"(id,name,email) values ('legacy','Existing contact','legacy@example.com');
    insert into inquiries(reference,idempotency_key,name,preferred_reply,service,message,network_hash)
      values ('MES-OLD','old','Existing contact','email','water','Existing request','old');
    insert into jobs(reference,inquiry_id,scope,next_step,assignee_id,customer_id)
      select 'JOB-OLD',id,'Existing work','Visit','legacy','legacy' from inquiries;
    insert into customer_invitations(job_id,name,email,token_hash,invited_by,expires_at)
      select id,'Pending contact','pending@example.com','existing-hash','legacy',now()+interval '1 day' from jobs;
  `);
  await migrate(journal.entries[3]);
  const { rows: [job] } = await db.query("select id, customer_id, company from jobs");
  assert.equal(job.customer_id, "legacy");
  assert.equal(job.company, null);
  const { rows: [invite] } = await db.query("select token_hash, cancelled_at from customer_invitations");
  assert.equal(invite.token_hash, "existing-hash");
  assert.equal(invite.cancelled_at, null);
  await assert.rejects(db.transaction(async tx => {
    await tx.query("insert into job_files(job_id,submission,name,mime,size,uploader,bytes) values ($1,'retry','site.png','image/png',1,'Test',decode('00','hex'))", [job.id]);
    throw Error("interrupted write");
  }), /interrupted write/);
  assert.equal((await db.query("select count(*)::int as n from job_files")).rows[0].n, 0);
} finally {
  await db.close();
}
