import { and, count, eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/server/db/client";
import { jobEvents, jobFiles, jobs } from "@/server/db/schema";
import { jobAccess } from "@/server/jobs";
import type { Viewer } from "@/server/session";
import { FileProblem, validateJobFile } from "@/server/validate-job-file";

const uuid = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;
const scope = (viewer: Viewer, reference: string) => and(eq(jobs.reference, reference), jobAccess(viewer));

export async function visibleFiles(viewer: Viewer, reference: string) {
  return (await getDb()).select({ id: jobFiles.id, name: jobFiles.name, size: jobFiles.size, uploader: jobFiles.uploader, createdAt: jobFiles.createdAt })
    .from(jobFiles).innerJoin(jobs, eq(jobs.id, jobFiles.jobId)).where(scope(viewer, reference)).orderBy(jobFiles.createdAt, jobFiles.id);
}

export async function uploadJobFile(viewer: Viewer, reference: string, key: string, file: File, shareInChat = false) {
  if (!uuid.test(key)) throw new FileProblem("Reload this job and select the file again.");
  const db = await getDb();
  const [allowed] = await db.select({ id: jobs.id }).from(jobs).where(scope(viewer, reference));
  if (!allowed) notFound();
  const checked = await validateJobFile(file);
  await db.transaction(async tx => {
    const [job] = await tx.select({ id: jobs.id, stage: jobs.stage }).from(jobs).where(scope(viewer, reference)).for("update");
    if (!job) notFound();
    const submission = [job.id, viewer.id, key].join(":");
    const [existing] = await tx.select({ id: jobFiles.id }).from(jobFiles).where(eq(jobFiles.submission, submission));
    if (existing) return;
    const [removed] = await tx.select({ id: jobEvents.id }).from(jobEvents).where(eq(jobEvents.eventKey, "removed:" + submission));
    if (removed) throw new FileProblem("This upload was already removed. Choose a new file if needed.");
    if (["completed", "cancelled"].includes(job.stage)) throw new FileProblem("This job is closed to uploads.");
    const [stored] = await tx.select({ total: count() }).from(jobFiles).where(eq(jobFiles.jobId, job.id));
    if (stored.total >= 20) throw new FileProblem("This job already has 20 files.");
    const [storedFile] = await tx.insert(jobFiles).values({ jobId: job.id, submission, name: checked.name, mime: checked.mime, size: file.size,
      uploader: viewer.name, bytes: sql`decode(${checked.bytes.toString("base64")}, 'base64')` }).returning({ id: jobFiles.id });
    if (shareInChat) {
      await tx.insert(jobEvents).values({ jobId: job.id, actorId: viewer.id, actorName: viewer.name,
        kind: "attachment", audience: "customer", body: checked.name, attachmentId: storedFile.id });
    }
  });
}

export async function downloadJobFile(viewer: Viewer, reference: string, id: string) {
  if (!uuid.test(id)) notFound();
  const [file] = await (await getDb()).select({ name: jobFiles.name, mime: jobFiles.mime, body: sql<string>`encode(${jobFiles.bytes}, 'base64')` })
    .from(jobFiles).innerJoin(jobs, eq(jobs.id, jobFiles.jobId)).where(and(scope(viewer, reference), eq(jobFiles.id, id)));
  if (!file) notFound();
  return file;
}

export async function removeJobFile(viewer: Viewer, reference: string, id: string, reason: string) {
  if (viewer.role !== "staff" && viewer.role !== "owner") notFound();
  if (!uuid.test(id) || !reason.trim() || reason.trim().length > 500) throw new FileProblem("Enter a removal reason of 1–500 characters.");
  await (await getDb()).transaction(async tx => {
    const [job] = await tx.select({ id: jobs.id }).from(jobs).where(eq(jobs.reference, reference)).for("update");
    if (!job) notFound();
    const [removed] = await tx.delete(jobFiles).where(and(eq(jobFiles.jobId, job.id), eq(jobFiles.id, id))).returning({ name: jobFiles.name, submission: jobFiles.submission });
    if (!removed) throw new FileProblem("The file has already been removed.");
    await tx.insert(jobEvents).values({ jobId: job.id, actorId: viewer.id, actorName: viewer.name, audience: "staff",
      kind: "file-removed", eventKey: "removed:" + removed.submission, body: `Removed ${removed.name}. ${reason.trim()}` });
  });
}
