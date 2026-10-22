import type { Viewer } from "@/server/session";

/** Heading and section links shared by the company workspace pages. */
export function WorkspaceHeader({ viewer, title, current }: { viewer: Viewer; title: string; current: "inquiries" | "team" }) {
  return <div className="workspace-head">
    <div><p className="eyebrow">COMPANY WORKSPACE · {viewer.role === "owner" ? "OWNER" : "STAFF"}</p><h1>{title}</h1></div>
    <nav className="workspace-nav" aria-label="Workspace">
      <a href="/staff" aria-current={current === "inquiries" ? "page" : undefined}>Inquiries</a>
      {viewer.role === "owner" && <a href="/staff/team" aria-current={current === "team" ? "page" : undefined}>Team</a>}
      <a href="/account">My account</a>
    </nav>
  </div>;
}
