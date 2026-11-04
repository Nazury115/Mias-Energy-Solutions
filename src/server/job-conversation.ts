import { and, eq, inArray, ne, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { ChatMessage } from "@/lib/job-conversation";
import { getDb } from "@/server/db/client";
import { jobEvents, jobs, messageReads } from "@/server/db/schema";
import { jobAccess } from "@/server/jobs";
import type { Viewer } from "@/server/session";

const sharedMessages = and(eq(jobEvents.audience, "customer"), inArray(jobEvents.kind, ["message", "update"]));
const accessibleJob = (reference: string, viewer: Viewer) => and(eq(jobs.reference, reference), jobAccess(viewer));

export async function readConversation(reference: string, viewer: Viewer): Promise<ChatMessage[]> {
  return (await getDb()).transaction(async tx => {
    const [job] = await tx.select({ id: jobs.id }).from(jobs).where(accessibleJob(reference, viewer)).for("share");
    if (!job) notFound();
    const rows = await tx.select({ id: jobEvents.id, actorId: jobEvents.actorId, author: jobEvents.actorName, kind: jobEvents.kind,
      body: jobEvents.body, at: jobEvents.createdAt, reader: messageReads.readerName, readAt: messageReads.readAt })
      .from(jobEvents).leftJoin(messageReads, and(eq(messageReads.eventId, jobEvents.id),
        or(eq(jobEvents.actorId, viewer.id), eq(messageReads.readerId, viewer.id))))
      .where(and(eq(jobEvents.jobId, job.id), sharedMessages)).orderBy(jobEvents.createdAt, jobEvents.id, messageReads.readAt, messageReads.readerId);
    const thread = new Map<string, ChatMessage>();
    for (const row of rows) {
      let message = thread.get(row.id);
      if (!message) {
        message = { id: row.id, author: row.author, own: row.actorId === viewer.id, seen: false, update: row.kind === "update",
          body: row.body, at: row.at.toISOString(), reads: [] };
        thread.set(row.id, message);
      }
      if (row.readAt && row.reader) {
        if (message.own) message.reads.push({ name: row.reader, at: row.readAt.toISOString() });
        else message.seen = true;
      }
    }
    return Array.from(thread.values());
  });
}

export async function recordMessageViews(reference: string, viewer: Viewer, ids: string[]) {
  await (await getDb()).transaction(async tx => {
    const [job] = await tx.select({ id: jobs.id }).from(jobs).where(accessibleJob(reference, viewer)).for("share");
    if (!job) notFound();
    const eligible = await tx.select({ id: jobEvents.id }).from(jobEvents).where(and(eq(jobEvents.jobId, job.id),
      sharedMessages, inArray(jobEvents.id, ids), ne(jobEvents.actorId, viewer.id)));
    if (eligible.length) await tx.insert(messageReads).values(eligible.map(event => ({
      eventId: event.id, readerId: viewer.id, readerName: viewer.name,
    }))).onConflictDoNothing();
  });
}
