import type { Metadata } from "next";
import { InviteForm } from "@/components/team-forms";
import { WorkspaceHeader } from "@/components/workspace-header";
import { requireViewer } from "@/server/session";
import { teamOverview } from "@/server/team";
import { cancelInvite, updatePerson } from "./actions";

export const metadata: Metadata = { title: "Team | Mias company workspace", robots: { index: false, follow: false } };
const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "medium", timeStyle: "short" });
const roleNames: Record<string, string> = { owner: "Owner", staff: "Staff" };

// Owners only (spec 007, INV-01–03): invite people, change roles, switch accounts off and on.
export default async function Team({ searchParams }: { searchParams: Promise<{ problem?: string | string[] }> }) {
  const viewer = await requireViewer(["owner"], "/staff/team");
  const { problem } = await searchParams;
  const { people, pending, changes } = await teamOverview();
  return <main id="main-content" className="site-container workspace" tabIndex={-1}>
    <WorkspaceHeader viewer={viewer} title="Team" current="team" />
    {typeof problem === "string" && <p role="alert" className="form-alert">{problem.slice(0, 200)}</p>}

    <section className="team-section" aria-labelledby="invite-heading"><h2 id="invite-heading">Invite someone</h2>
      <div className="account-card"><InviteForm /></div></section>

    <section className="team-section" aria-labelledby="pending-heading"><h2 id="pending-heading">Pending invitations</h2>
      {pending.length ? <ul className="people-list">{pending.map(invitation => <li key={invitation.id} data-invitation>
        <span><strong>{invitation.name}</strong> · {invitation.email} · {roleNames[invitation.role]} · expires {when.format(invitation.expiresAt)}</span>
        <form action={cancelInvite}><input type="hidden" name="invitationId" value={invitation.id} /><button className="button button-small button-light" type="submit">Cancel invitation</button></form>
      </li>)}</ul> : <p className="muted">No pending invitations.</p>}</section>

    <section className="team-section" aria-labelledby="people-heading"><h2 id="people-heading">People</h2>
      <ul className="people-list">{people.map(person => <li key={person.id} data-person>
        <span><strong>{person.name}</strong>{person.id === viewer.id ? " (you)" : ""} · {person.email}<br />
          <span className={person.status === "active" ? "status-pill" : "status-pill is-off"}>{person.status === "active" ? "Active" : "Deactivated"}</span> {roleNames[person.role]} · last sign-in {person.lastSignIn ? when.format(new Date(person.lastSignIn)) : "never"}</span>
        <div className="person-actions">
          <form action={updatePerson}><input type="hidden" name="userId" value={person.id} />
            <label className="visually-hidden" htmlFor={`role-${person.id}`}>Role for {person.name}</label>
            <select id={`role-${person.id}`} name="role" defaultValue={person.role}><option value="staff">Staff</option><option value="owner">Owner</option></select>
            <button className="button button-small button-light" type="submit">Change role</button></form>
          <form action={updatePerson}><input type="hidden" name="userId" value={person.id} /><input type="hidden" name="status" value={person.status === "active" ? "deactivated" : "active"} />
            <button className="button button-small button-light" type="submit">{person.status === "active" ? "Deactivate" : "Reactivate"}</button></form>
        </div>
      </li>)}</ul></section>

    <section className="team-section" aria-labelledby="changes-heading"><h2 id="changes-heading">Recent changes</h2>
      {changes.length ? <ul className="people-list">{changes.map(change => <li key={change.id}><span>{when.format(change.createdAt)} · {change.detail}</span></li>)}</ul> : <p className="muted">No changes yet.</p>}</section>
  </main>;
}
