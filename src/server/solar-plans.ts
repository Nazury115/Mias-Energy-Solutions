import { and,eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/server/db/client";
import { inquiries,jobs } from "@/server/db/schema";
import { jobAccess } from "@/server/jobs";
import type { Viewer } from "@/server/session";

export async function jobSolarPlan(viewer:Viewer,reference:string) {
  const [row]=await (await getDb()).select({plan:inquiries.solarPlan}).from(jobs).innerJoin(inquiries,eq(inquiries.id,jobs.inquiryId))
    .where(and(eq(jobs.reference,reference),jobAccess(viewer)));
  if(!row)notFound();
  return row.plan;
}
