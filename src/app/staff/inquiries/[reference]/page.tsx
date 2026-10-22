import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { inquiryServices } from "@/lib/inquiry";
import { displayPhone, replyMethods, type ReplyMethod } from "@/lib/inquiry-submission";
import { WorkspaceHeader } from "@/components/workspace-header";
import { getDb } from "@/server/db/client";
import { user } from "@/server/db/schema";
import { findInquiry } from "@/server/inquiries";
import { requireViewer } from "@/server/session";

// Signed-in content must never be pre-rendered at build time (found in production verification, 007).
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inquiry | Mias company workspace", robots: { index: false, follow: false } };
const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "full", timeStyle: "short" });

export default async function InquiryDetail({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  // The role check runs before the lookup, so other accounts learn nothing about which references exist (ROLE-03).
  const viewer = await requireViewer(["staff", "owner"], `/staff/inquiries/${reference}`);
  const found = await findInquiry(reference);
  if (!found) notFound();
  const { inquiry, status, attempts } = found;
  const [account] = inquiry.userId ? await (await getDb()).select({ email: user.email }).from(user).where(eq(user.id, inquiry.userId)) : [];
  const rows: [string, string][] = [
    ["Received", `${when.format(inquiry.createdAt)} (Zambia time)`], ["Name", inquiry.name],
    ["Phone", inquiry.phone ? displayPhone(inquiry.phone) : "—"], ["Email", inquiry.email ?? "—"],
    ["Reply by", replyMethods[inquiry.preferredReply as ReplyMethod]], ["Service", inquiryServices[inquiry.service as keyof typeof inquiryServices]],
    ["Project area", inquiry.area ?? "—"], ["Customer account", account ? account.email : "Sent without signing in"],
    ["Notification", status ? `${status} (${attempts} attempt${attempts === 1 ? "" : "s"})` : "—"], ["Project details", inquiry.message],
  ];
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title={inquiry.reference} current="inquiries" />
    <p className="account-links"><a href="/staff">← All inquiries</a></p>
    <dl className="detail-list">{rows.map(([term, value]) => <div key={term} style={{ display: "contents" }}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
  </main>;
}
