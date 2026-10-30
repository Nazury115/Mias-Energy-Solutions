const date = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lusaka", dateStyle: "medium", timeStyle: "short" });
const names: Record<string, string> = { created: "Request accepted", progress: "Progress", message: "Message", update: "Customer update", note: "Private staff note", "acceptance-reason": "Acceptance reason", "change-reason": "Change reason", "access-invited": "Customer invited", "access-accepted": "Access accepted", "access-revoked": "Access revoked", "invitation-cancelled": "Invitation cancelled" };
export function JobHistory({ events }: { events: { id: string; kind: string; actorName: string; body: string; audience: string; createdAt: Date }[] }) {
  return events.length ? <ol className="job-timeline">{events.map(event => <li key={event.id} className={event.audience === "staff" ? "is-private" : ""} data-event-audience={event.audience}>
    <p className="field-hint"><strong>{names[event.kind] ?? "Job event"}</strong> · {date.format(event.createdAt)} (Zambia time) · {event.actorName}</p>
    <p className="job-event-body">{event.body}</p>
  </li>)}</ol> : <p className="muted">No updates yet.</p>;
}
