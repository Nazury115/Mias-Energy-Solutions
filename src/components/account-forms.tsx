"use client";
import { useActionState, useEffect, useRef } from "react";
import { forgotPassword, joinFromInvitation, resendConfirmation, resetPassword, signIn, signUp, updateProfile, type AccountFormState } from "@/app/account/actions";

const idle: AccountFormState = { status: "idle" };

type FieldProps = {
  id: string; name: string; label: string; state: AccountFormState;
  type?: string; autoComplete?: string; hint?: string; optional?: boolean; defaultValue?: string;
};
function Field({ id, name, label, state, type = "text", autoComplete, hint, optional = false, defaultValue = "" }: FieldProps) {
  const error = state.status === "error" ? state.errors?.[name] : undefined;
  const value = state.status === "error" ? state.values[name] ?? defaultValue : defaultValue;
  const describedBy = [error ? `${id}-error` : "", hint ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined;
  return <div className="account-field">
    <label htmlFor={id}>{label}{optional && <span> (optional)</span>}</label>
    <input id={id} name={name} type={type} autoComplete={autoComplete} defaultValue={value} required={!optional} aria-invalid={!!error} aria-describedby={describedBy} />
    {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
    {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
  </div>;
}

/** Moves focus to the first invalid field, or to the message, after each failed submission (AUTH-06). */
function useFocusOnError(state: AccountFormState) {
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "error") form.current?.querySelector<HTMLElement>("[aria-invalid=true], [role=alert]")?.focus();
  }, [state]);
  return form;
}
const Message = ({ state }: { state: AccountFormState }) => state.status === "error" && state.message ? <p role="alert" className="form-alert" tabIndex={-1}>{state.message}</p> : null;
const Submit = ({ pending, label, busy }: { pending: boolean; label: string; busy: string }) =>
  <button className="button" type="submit" disabled={pending}>{pending ? busy : label} <span aria-hidden="true">↗</span></button>;

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, idle);
  const form = useFocusOnError(state);
  if (state.status === "done") return <div className="account-done" role="status">
    <h2>Check your email</h2>
    <p>We’ve sent a confirmation link to <strong>{state.values?.email}</strong>. Open it to finish creating your account; it expires in 24 hours.</p>
    <p className="muted">Nothing arrived? Check your spam folder, or ask for a new link from the sign-in page.</p>
  </div>;
  return <form ref={form} action={action} noValidate className="account-form">
    <Message state={state} />
    <Field id="sign-up-name" name="name" label="Your name" autoComplete="name" state={state} />
    <Field id="sign-up-email" name="email" label="Email address" type="email" autoComplete="email" state={state} />
    <Field id="sign-up-phone" name="phone" label="Phone number" type="tel" autoComplete="tel" optional state={state} />
    <Field id="sign-up-password" name="password" label="Password" type="password" autoComplete="new-password" hint="At least 10 characters. A few unrelated words together works well." state={state} />
    <Submit pending={pending} label="Create account" busy="Creating account…" />
    <p className="account-links">Already have an account? <a href="/sign-in">Sign in</a></p>
  </form>;
}

function ConfirmFirst({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendConfirmation, idle);
  return <div className="account-done" role="status">
    <h2>Confirm your email first</h2>
    <p>We sent a confirmation link to <strong>{email}</strong> when you signed up. Open it, then sign in again.</p>
    {state.status === "done" ? <p>{state.message}</p> : <form action={action}><input type="hidden" name="email" value={email} /><button className="button button-light" type="submit" disabled={pending}>Send the link again</button></form>}
  </div>;
}

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, idle);
  const form = useFocusOnError(state);
  if (state.status === "unverified") return <ConfirmFirst email={state.email} />;
  return <form ref={form} action={action} noValidate className="account-form">
    <input type="hidden" name="next" value={next} />
    <Message state={state} />
    <Field id="sign-in-email" name="email" label="Email address" type="email" autoComplete="email" state={state} />
    <Field id="sign-in-password" name="password" label="Password" type="password" autoComplete="current-password" state={state} />
    <Submit pending={pending} label="Sign in" busy="Signing in…" />
    <p className="account-links"><a href="/forgot-password">Forgot your password?</a> · <a href="/sign-up">Create an account</a></p>
  </form>;
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPassword, idle);
  if (state.status === "done") return <div className="account-done"><p role="status">{state.message}</p><p className="account-links"><a href="/sign-in">Back to sign in</a></p></div>;
  return <form action={action} noValidate className="account-form">
    <Field id="forgot-email" name="email" label="Email address" type="email" autoComplete="email" state={state} />
    <Submit pending={pending} label="Email me a reset link" busy="Sending…" />
  </form>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, idle);
  const form = useFocusOnError(state);
  if (state.status === "done") return <div className="account-done" role="status"><h2>Password changed</h2><p>You’ve been signed out everywhere else. Sign in with your new password.</p><a className="button" href="/sign-in">Sign in <span aria-hidden="true">↗</span></a></div>;
  return <form ref={form} action={action} noValidate className="account-form">
    <input type="hidden" name="token" value={token} />
    <Message state={state} />
    <Field id="reset-password" name="password" label="New password" type="password" autoComplete="new-password" hint="At least 10 characters." state={state} />
    <Submit pending={pending} label="Set new password" busy="Saving…" />
  </form>;
}

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, action, pending] = useActionState(updateProfile, idle);
  const form = useFocusOnError(state);
  return <form ref={form} action={action} noValidate className="account-form">
    {state.status === "done" && <p role="status" className="form-success">{state.message}</p>}
    <Field id="profile-name" name="name" label="Your name" autoComplete="name" defaultValue={name} state={state} />
    <Field id="profile-phone" name="phone" label="Phone number" type="tel" autoComplete="tel" optional defaultValue={phone} state={state} />
    <Submit pending={pending} label="Save details" busy="Saving…" />
  </form>;
}

export function InvitationForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(joinFromInvitation, idle);
  const form = useFocusOnError(state);
  return <form ref={form} action={action} noValidate className="account-form">
    <input type="hidden" name="token" value={token} />
    <Message state={state} />
    <Field id="invite-password" name="password" label="Choose a password" type="password" autoComplete="new-password" hint="At least 10 characters. A few unrelated words together works well." state={state} />
    <Submit pending={pending} label="Create my account" busy="Creating…" />
  </form>;
}
