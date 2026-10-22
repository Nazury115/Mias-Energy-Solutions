import type { Metadata } from "next";
import { inquiryServices } from "@/lib/inquiry";
import { WorkspaceHeader } from "@/components/workspace-header";
import { searchInquiries } from "@/server/inquiries";
import { requireViewer } from "@/server/session";

export const metadata: Metadata = { title: "Inquiries | Mias company workspace", robots: { index: false, follow: false } };
const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "medium", timeStyle: "short" });
const statusLabels: Record<string, string> = { sent: "Delivered", failed: "Failed, retrying", pending: "Waiting" };

// Every inquiry, for Owners and Staff only (spec 007, STAFF-01).
export default async function StaffInquiries({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const viewer = await requireViewer(["staff", "owner"], "/staff");
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 100) : "";
  const rows = await searchInquiries(query);
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title="Inquiries" current="inquiries" />
    <form className="search-bar" role="search" action="/staff">
      <div><label htmlFor="staff-search">Search inquiries</label><input id="staff-search" name="q" defaultValue={query} placeholder="Reference, name, phone or email" /></div>
      <button className="button button-small" type="submit">Search</button>
    </form>
    <p className="muted">{rows.length === 1 ? "1 inquiry" : `${rows.length} inquiries`}{query ? ` matching “${query}”` : ", newest first"}</p>
    {rows.length > 0 && <div className="table-scroll"><table className="data-table">
      <thead><tr><th>Reference</th><th>Name</th><th>Service</th><th>Area</th><th>Received</th><th>Notification</th></tr></thead>
      <tbody>{rows.map(({ inquiry, status }) => <tr key={inquiry.id}>
        <td><a href={`/staff/inquiries/${inquiry.reference}`}>{inquiry.reference}</a></td><td>{inquiry.name}</td>
        <td>{inquiryServices[inquiry.service as keyof typeof inquiryServices]}</td><td>{inquiry.area ?? "—"}</td>
        <td>{when.format(inquiry.createdAt)}</td><td>{statusLabels[status ?? ""] ?? "—"}</td>
      </tr>)}</tbody>
    </table></div>}
  </main>;
}
