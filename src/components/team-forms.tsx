"use client";
import { useActionState } from "react";
import { invitePerson, type InviteFormState } from "@/app/staff/team/actions";

const idle: InviteFormState = { status: "idle" };

export function InviteForm() {
  const [state, action, pending] = useActionState(invitePerson, idle);
  const errors = state.status === "error" ? state.errors : {};
  const values = state.status === "error" ? state.values : { name: "", email: "", role: "staff" };
  const field = (name: string) => ({ "aria-invalid": !!errors[name], "aria-describedby": errors[name] ? `invite-${name}-error` : undefined });
  const error = (name: string) => errors[name] ? <p className="field-error" id={`invite-${name}-error`}>{errors[name]}</p> : null;
  return <form action={action} noValidate className="account-form invite-form" data-invite-form>
    {state.status === "done" && <p role="status" className="form-success">Invitation sent to {state.email}. The link expires in 7 days.</p>}
    <div className="form-grid">
      <div className="account-field"><label htmlFor="invite-name">Name</label><input id="invite-name" name="name" defaultValue={values.name} required {...field("name")} />{error("name")}</div>
      <div className="account-field"><label htmlFor="invite-email">Email address</label><input id="invite-email" name="email" type="email" defaultValue={values.email} required {...field("email")} />{error("email")}</div>
    </div>
    <div className="account-field"><label htmlFor="invite-role">Role</label>
      <select id="invite-role" name="role" defaultValue={values.role} {...field("role")}><option value="staff">Staff: handles inquiries and jobs</option><option value="owner">Owner: everything, including the team</option></select>{error("role")}</div>
    <button className="button" type="submit" disabled={pending}>{pending ? "Sending…" : "Send invitation"} <span aria-hidden="true">↗</span></button>
  </form>;
}
