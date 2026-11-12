"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { jobStages, requestStages } from "@/lib/jobs";
import { acceptRequest, cancelCustomerInvite, inviteCustomer, retryJobNotifications, reviewRequest, revokeAccess, saveJob, staffMessage, type JobFormState } from "@/app/staff/jobs/actions";
import { customerMessage } from "@/app/account/jobs/actions";
import { acceptJobInvitation } from "@/app/job-invite/actions";
import { staffUpload, staffRemoveFile } from "@/app/staff/jobs/actions";
import { customerUpload } from "@/app/account/jobs/actions";

const idle: JobFormState = { status: "idle" };

export function UploadForm({ reference, submission, customer, chat = false }: { reference: string; submission: string; customer: boolean; chat?: boolean }) {
  const { state, submit, pending, form } = useJobForm(customer ? customerUpload : staffUpload);
  const [problem, setProblem] = useState("");
  const [camera, setCamera] = useState(false);
  const id = chat ? "chat-file" : "job-file";
  return <form ref={form} action={submit} className="account-form job-form" onSubmit={event => {
    const file = (event.currentTarget.elements.namedItem("file") as HTMLInputElement).files?.[0];
    if (file && file.size > 5 * 1024 * 1024) { event.preventDefault(); setProblem("Choose a file of 5 MiB or less."); }
  }}>
    <Hidden reference={reference} /><input type="hidden" name="submission" value={submission} />
    {chat && <>
      <input type="hidden" name="shareInChat" value="yes" />
      <label><input type="checkbox" checked={camera} onChange={event => setCamera(event.target.checked)} /> Use camera</label>
    </>}
    <label htmlFor={id}>{chat ? "Choose an attachment" : "Choose a job file"}</label><p id={id + "-help"}>JPEG, PNG or PDF. Up to 5 MiB per file and 20 files per job.</p>
    <input key={String(camera)} id={id} name="file" type="file" required accept={camera ? "image/jpeg,image/png" : "image/jpeg,image/png,application/pdf"} capture={camera ? "environment" : undefined} aria-describedby={id + "-help"} onChange={() => setProblem("")} />
    {problem ? <p role="alert">{problem}</p> : <Feedback state={state} />}<Button pending={pending}>{chat ? "Send attachment" : "Upload file"}</Button>
  </form>;
}

export function RemoveFileForm({ reference, id, name }: { reference: string; id: string; name: string }) {
  const { state, submit, pending, form } = useJobForm(staffRemoveFile);
  return <form ref={form} action={submit} className="account-form job-form">
    <Hidden reference={reference} /><input type="hidden" name="fileId" value={id} />
    <label htmlFor={"remove-" + id}>Reason for removing {name}</label><input id={"remove-" + id} name="reason" required maxLength={500} />
    <Feedback state={state} /><Button pending={pending}>Remove file</Button>
  </form>;
}
const draft = (state: JobFormState, name: string, fallback = "") => state.status === "error" ? state.values?.[name] ?? fallback : fallback;
function useJobForm(action: (previous: JobFormState, form: FormData) => Promise<JobFormState>) {
  const [state, submit, pending] = useActionState(action, idle), form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.status === "error") form.current?.querySelector<HTMLElement>("[role=alert]")?.focus(); }, [state]);
  return { state, submit, pending, form };
}
function Feedback({ state }: { state: JobFormState }) {
  return state.status === "idle" ? null : <p role={state.status === "error" ? "alert" : "status"} tabIndex={-1} className={state.status === "error" ? "form-alert" : "form-success"}>{state.message}</p>;
}
function Hidden({ reference, version, state = idle }: { reference: string; version?: number; state?: JobFormState }) {
  const [baseVersion, setBaseVersion] = useState(state.status === "error" ? state.baseVersion ?? version : version);
  const control = useRef<HTMLInputElement>(null), dirty = useRef(state.status === "error");
  useEffect(() => {
    const form = control.current?.form;
    const changed = () => { dirty.current = true; };
    form?.addEventListener("input", changed);
    form?.addEventListener("change", changed);
    return () => { form?.removeEventListener("input", changed); form?.removeEventListener("change", changed); };
  }, [reference]);
  // Revalidation by another form may show a newer job while this form still has an
  // edited draft. Keep its original version so that draft cannot overwrite newer work.
  useEffect(() => { if (!dirty.current) setBaseVersion(version); }, [version]);
  useEffect(() => {
    if (state.status === "error") { dirty.current = true; if (state.baseVersion) setBaseVersion(state.baseVersion); }
    if (state.status === "done" && state.baseVersion) { dirty.current = false; setBaseVersion(state.baseVersion); }
  }, [state]);
  return <><input type="hidden" name="reference" value={reference} />{baseVersion !== undefined && <input ref={control} type="hidden" name="expectedVersion" value={baseVersion} />}</>;
}
const Button = ({ pending, children }: { pending: boolean; children: React.ReactNode }) => <button className="button button-small" type="submit" disabled={pending}>{pending ? "Saving…" : children}</button>;
type StaffPerson = { id: string; name: string };
type Workflow = { reference: string; version: number; scope: string; nextStep: string; assigneeId: string; stage: string };

export function JobWorkflowForm({ job, people, accept = false }: { job: Workflow; people: StaffPerson[]; accept?: boolean }) {
  const { state, submit, pending, form } = useJobForm(accept ? acceptRequest : saveJob);
  return <form ref={form} action={submit} className="account-form job-form" data-accept-job={accept ? "" : undefined} data-workflow-form={!accept ? "" : undefined}>
    <Hidden reference={job.reference} version={job.version} state={state} /><Feedback state={state} />
    <label htmlFor="job-scope">Agreed scope</label><textarea id="job-scope" name="scope" defaultValue={draft(state, "scope", job.scope)} maxLength={1500} required rows={3} />
    <label htmlFor="job-next">Next step</label><textarea id="job-next" name="nextStep" defaultValue={draft(state, "nextStep", job.nextStep)} maxLength={500} required rows={2} />
    <label htmlFor="job-assignee">Responsible staff</label><select id="job-assignee" name="assigneeId" defaultValue={draft(state, "assigneeId", job.assigneeId)} required>{people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select>
    {!accept && <><label htmlFor="job-stage">Stage</label><select id="job-stage" name="stage" defaultValue={draft(state, "stage", job.stage)}>{Object.entries(jobStages).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></>}
    <label htmlFor="job-reason">Reason</label><textarea id="job-reason" name="reason" defaultValue={draft(state, "reason")} maxLength={500} required rows={2} aria-describedby="job-reason-help" />
    <p className="field-hint" id="job-reason-help">Recorded for staff only. Customers see the agreed scope, stage and next step.</p>
    {accept && <p className="field-hint">Accept after agreeing the work and checking the supplied contacts. Acceptance sends an email confirmation when an email address is provided. Customer portal access is invited separately.</p>}
    <Button pending={pending}>{accept ? "Accept and create job" : "Update job"}</Button>
  </form>;
}
export function ReviewForm({ reference, version, status }: { reference: string; version: number; status: string }) {
  const { state, submit, pending, form } = useJobForm(reviewRequest);
  return <form ref={form} action={submit} className="account-form job-form"><Hidden reference={reference} version={version} state={state} /><Feedback state={state} />
    <label htmlFor="review-stage">Review status</label><select name="reviewStatus" id="review-stage" defaultValue={draft(state, "reviewStatus", status)}>{Object.entries(requestStages).filter(([value]) => value !== "accepted").map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    <label htmlFor="review-reason">Review reason</label><textarea id="review-reason" name="reason" defaultValue={draft(state, "reason")} maxLength={500} required rows={2} /><Button pending={pending}>Save review</Button>
  </form>;
}
export function ChatReplyForm({ reference, eventKey, customer = false }: { reference: string; eventKey: string; customer?: boolean }) {
  const action = customer ? customerMessage : staffMessage;
  const { state, submit, form, pending } = useJobForm(action);
  const [feedback, setFeedback] = useState<JobFormState | null>(null);
  const [sending, setSending] = useState(false);
  const inFlight = useRef(false);
  const attempt = useRef<{ body: string; key: string } | null>(null);
  return <form ref={form} action={submit} className="account-form job-form" onSubmit={async event => {
    // Keep the native server action for plain HTML. Enhanced sends also recover
    // when a reply is saved but its acknowledgement is lost in transit.
    event.preventDefault();
    if (inFlight.current) return;
    const element = event.currentTarget;
    const data = new FormData(element);
    const body = String(data.get("body"));
    if (attempt.current?.body !== body) attempt.current = { body, key: crypto.randomUUID() };
    data.set("eventKey", attempt.current.key);
    inFlight.current = true;
    setSending(true);
    try {
      const result = await action(idle, data);
      setFeedback(result);
      if (result.status === "done") {
        attempt.current = null;
        (element.elements.namedItem("body") as HTMLTextAreaElement).value = "";
      }
    } catch {
      setFeedback({ status: "error", message: "Could not confirm the send. Retry to check or send this message." });
    } finally { inFlight.current = false; setSending(false); }
  }}>
    <Hidden reference={reference} /><input type="hidden" name="kind" value="message" /><input type="hidden" name="eventKey" value={eventKey} />
    <label htmlFor="job-message">{customer ? "Message to Mias" : "Message to customer"}</label>
    <textarea id="job-message" name="body" placeholder="Write a message…" defaultValue={draft(state, "body")} maxLength={2000} rows={2} required readOnly={sending} />
    <Feedback state={feedback ?? state} /><Button pending={sending || pending}>{feedback?.status === "error" ? "Retry message" : "Send message"}</Button>
  </form>;
}

export function JobMessageForm({ reference, kind, eventKey }: { reference: string; kind: "update" | "note"; eventKey: string }) {
  const { state, submit, pending, form } = useJobForm(staffMessage);
  const label = kind === "note" ? "Internal note" : "Customer update";
  return <form ref={form} action={submit} className="account-form job-form"><Hidden reference={reference} /><input type="hidden" name="kind" value={kind} /><input type="hidden" name="eventKey" value={eventKey} /><Feedback state={state} />
    <label htmlFor={`job-${kind}`}>{label}</label><textarea id={`job-${kind}`} name="body" defaultValue={draft(state, "body")} maxLength={2000} rows={3} required aria-describedby={`job-${kind}-hint`} />
    <p id={`job-${kind}-hint`} className="field-hint">{kind === "note" ? "Only Mias staff can see this note." : "Shared with Mias staff and all contacts who have access to this job. No email is sent for this update."}</p>
    <Button pending={pending}>{kind === "note" ? "Save private note" : "Publish update"}</Button>
  </form>;
}
export function CustomerInviteForm({ reference, version, name, email, company }: { reference: string; version: number; name: string; email: string; company: string }) {
  const { state, submit, pending, form } = useJobForm(inviteCustomer);
  return <form ref={form} action={submit} className="account-form job-form" data-customer-invite><Hidden reference={reference} version={version} state={state} /><Feedback state={state} />
    <label htmlFor="job-company">Company for this job (optional)</label><input id="job-company" name="company" maxLength={120} defaultValue={draft(state, "company", company)} />
    <label htmlFor="customer-name">Customer name</label><input id="customer-name" name="name" defaultValue={draft(state, "name", name)} maxLength={80} required />
    <label htmlFor="customer-email">Customer email</label><input id="customer-email" name="email" type="email" defaultValue={draft(state, "email", email)} maxLength={254} required />
    <label className="job-checkbox"><input type="checkbox" name="checked" value="yes" required />I have checked this customer's identity and contact details</label>
    <p className="field-hint">Creates a seven-day invitation. Resending to the same email replaces its previous link. Each invited contact can see the job’s customer-visible history and shared files. Existing customers must sign in to accept.</p>
    <Button pending={pending}>Invite customer</Button>
  </form>;
}
export function RevokeAccessForm({ reference, version, contactId }: { reference: string; version: number; contactId: string }) {
  const { state, submit, pending, form } = useJobForm(revokeAccess);
  return <form ref={form} action={submit} className="account-form job-form"><Hidden reference={reference} version={version} state={state} /><Feedback state={state} />
    <input type="hidden" name="contactId" value={contactId} /><label htmlFor={"revoke-" + contactId}>Reason for revoking access</label><textarea id={"revoke-" + contactId} name="reason" defaultValue={draft(state, "reason")} maxLength={500} rows={2} required /><Button pending={pending}>Revoke customer access</Button>
  </form>;
}
export function CancelCustomerInviteForm({ reference, version, id }: { reference: string; version: number; id: string }) {
  const { state, submit, pending, form } = useJobForm(cancelCustomerInvite);
  return <form ref={form} action={submit}><Hidden reference={reference} version={version} state={state} /><input type="hidden" name="invitationId" value={id} /><Feedback state={state} /><Button pending={pending}>Cancel customer invitation</Button></form>;
}
export function RetryJobNotificationsForm({ reference }: { reference: string }) {
  const { state, submit, pending, form } = useJobForm(retryJobNotifications);
  return <form ref={form} action={submit}><Hidden reference={reference} /><Feedback state={state} /><Button pending={pending}>Retry pending notifications</Button></form>;
}
export function AcceptJobInvitationForm({ token, existing = false }: { token: string; existing?: boolean }) {
  const { state, submit, pending, form } = useJobForm(acceptJobInvitation);
  return <form ref={form} action={submit} className="account-form job-form"><input type="hidden" name="token" value={token} /><input type="hidden" name="existing" value={existing ? "yes" : "no"} /><Feedback state={state} />
    {!existing && <><label htmlFor="job-password">Choose a password</label><input id="job-password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /><p className="field-hint">At least 10 characters. A few unrelated words work well.</p></>}
    <Button pending={pending}>{existing ? "Accept job access" : "Create account and open job"}</Button>
  </form>;
}
