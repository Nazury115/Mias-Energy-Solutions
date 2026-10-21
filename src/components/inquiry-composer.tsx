"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { business } from "@/content/site";
import { getContactLinks } from "@/lib/contact-links";
import { inquiryServices, prepareInquiry, type InquiryErrors } from "@/lib/inquiry";
import { replyMethods, type InquirySubmissionInput, type ReplyMethod } from "@/lib/inquiry-submission";
import { sendInquiry, type InquiryFormState } from "@/app/contact/actions";

type Field = keyof InquirySubmissionInput;
const idle: InquiryFormState = { status: "idle" };
const replySentence: Record<ReplyMethod, (contact: string) => string> = {
  whatsapp: contact => `Israel will reply on WhatsApp at ${contact}.`,
  phone: contact => `Israel will call you on ${contact}.`,
  email: contact => `Israel will reply by email to ${contact}.`,
};

// "Send inquiry to Mias" saves the inquiry on the server (works without JavaScript too);
// "Prepare WhatsApp message" stays available as the secondary route (spec 006, D-2).
export function InquiryComposer({ initialService, initialArea = "", formToken, idempotencyKey }: { initialService: string; initialArea?: string; formToken: string; idempotencyKey: string }) {
  const [state, formAction, pending] = useActionState(sendInquiry, idle);
  const [input, setInput] = useState<InquirySubmissionInput>(() => ({
    name: "", phone: "", email: "", preferredReply: "whatsapp", service: initialService, area: initialArea, message: "",
    ...("values" in state ? state.values : {}),
  }));
  const [mode, setMode] = useState<"send" | "whatsapp">("send");
  const [whatsappErrors, setWhatsappErrors] = useState<InquiryErrors>({});
  const [prepared, setPrepared] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (state.status === "invalid") form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state]);

  const links = getContactLinks(business.contacts);
  const href = (kind: string) => links.find(link => link.kind === kind)?.href;
  const directly = <>call <a href={href("phone")}>{business.phoneDisplay}</a>, <a href={href("whatsapp")} rel="noopener noreferrer">WhatsApp</a> or <a href={href("email")}>email</a> Israel directly.</>;
  const errors: Partial<Record<Field, string>> = mode === "whatsapp" ? whatsappErrors : state.status === "invalid" ? state.errors : {};
  const change = (field: Field, value: string) => {
    setInput(current => ({ ...current, [field]: value }));
    setPrepared(null);
    setWhatsappErrors(current => ({ ...current, [field]: undefined }));
  };
  const describedBy = (field: Field, hint?: string) => [errors[field] ? `${field}-error` : "", hint ?? ""].filter(Boolean).join(" ") || undefined;
  const error = (field: Field) => errors[field] ? <p className="field-error" id={`${field}-error`}>{errors[field]}</p> : null;
  const prepareWhatsApp = () => {
    setMode("whatsapp");
    const result = prepareInquiry({ name: input.name, service: input.service, area: input.area, message: input.message });
    if (!result.ok) {
      setWhatsappErrors(result.errors);
      setPrepared(null);
      form.current?.querySelector<HTMLElement>(`[name="${Object.keys(result.errors)[0]}"]`)?.focus();
    } else {
      setWhatsappErrors({});
      setPrepared(result.message);
    }
  };
  const whatsapp = prepared ? getContactLinks(business.contacts, prepared).find(link => link.kind === "whatsapp") : null;

  if (state.status === "received" || state.status === "saved-unnotified") {
    const saved = state.status === "saved-unnotified";
    return <div className={saved ? "inquiry-card inquiry-result is-warning" : "inquiry-card inquiry-result"} role="status" aria-live="polite">
      <p className="eyebrow">{saved ? "INQUIRY SAVED" : "INQUIRY RECEIVED"}</p>
      <h2>Thank you, {state.name}.</h2>
      {saved
        ? <p>Your inquiry is saved with reference <span className="reference">{state.reference}</span>, but we couldn’t notify Mias just now. We’ll keep trying. So nothing is delayed, please also call or WhatsApp Israel on {business.phoneDisplay}.</p>
        : <p>Your reference is <span className="reference">{state.reference}</span>. {replySentence[state.preferredReply](state.contact)}</p>}
      <p>Keep the reference in case you need to follow up.</p>
      <dl className="result-summary">
        <div><dt>Service</dt><dd>{inquiryServices[state.values.service as keyof typeof inquiryServices] ?? "General inquiry"}</dd></div>
        {state.values.area.trim() && <div><dt>Project area</dt><dd>{state.values.area.trim()}</dd></div>}
        <div><dt>Details</dt><dd>{state.values.message.trim().slice(0, 280)}{state.values.message.trim().length > 280 ? "…" : ""}</dd></div>
      </dl>
      <a className="button" href="/contact">Send another inquiry <span aria-hidden="true">↗</span></a>
    </div>;
  }

  return <div className="inquiry-card">
    <p className="eyebrow">START WITH A FEW DETAILS</p><h2>Tell us what you need.</h2>
    <p className="muted">Send your inquiry straight to Mias and Israel will reply the way you choose. Prefer WhatsApp? You can prepare a WhatsApp message instead.</p>
    <form ref={form} action={formAction} noValidate data-inquiry-form onSubmit={() => setMode("send")}>
      <input type="hidden" name="formToken" value={formToken} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <div className="trap-field" aria-hidden="true"><label htmlFor="inquiry-check">Leave this field empty</label><input id="inquiry-check" name="mias_check" tabIndex={-1} autoComplete="off" defaultValue="" /></div>

      <label htmlFor="inquiry-name">Your name</label>
      <input id="inquiry-name" name="name" autoComplete="name" value={input.name} maxLength={80} required aria-invalid={!!errors.name} aria-describedby={describedBy("name")} onChange={e => change("name", e.target.value)} />{error("name")}

      <fieldset className="contact-fields"><legend>How can Israel reach you? <span>(phone, email or both)</span></legend>
        <div className="form-grid">
          <div><label htmlFor="inquiry-phone">Phone number</label><input id="inquiry-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0977 123 456" value={input.phone} maxLength={40} aria-invalid={!!errors.phone} aria-describedby={describedBy("phone")} onChange={e => change("phone", e.target.value)} />{error("phone")}</div>
          <div><label htmlFor="inquiry-email">Email address</label><input id="inquiry-email" name="email" type="email" autoComplete="email" value={input.email} maxLength={254} aria-invalid={!!errors.email} aria-describedby={describedBy("email")} onChange={e => change("email", e.target.value)} />{error("email")}</div>
        </div>
      </fieldset>

      <fieldset className="reply-choice" aria-describedby={describedBy("preferredReply")}><legend>How should Israel reply?</legend>
        <div className="reply-options">{(Object.keys(replyMethods) as ReplyMethod[]).map(method => <label key={method}>
          <input type="radio" name="preferredReply" value={method} checked={input.preferredReply === method} aria-invalid={!!errors.preferredReply && input.preferredReply === method} onChange={() => change("preferredReply", method)} />{replyMethods[method]}
        </label>)}</div>{error("preferredReply")}
      </fieldset>

      <div className="form-grid">
        <div><label htmlFor="inquiry-service">Service</label><select id="inquiry-service" name="service" value={input.service} aria-invalid={!!errors.service} aria-describedby={describedBy("service")} onChange={e => change("service", e.target.value)}>{Object.entries(inquiryServices).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select>{error("service")}</div>
        <div><label htmlFor="inquiry-area">Project area <span>(optional)</span></label><input id="inquiry-area" name="area" value={input.area} maxLength={120} placeholder="For example, Lusaka" aria-invalid={!!errors.area} aria-describedby={describedBy("area")} onChange={e => change("area", e.target.value)} />{error("area")}</div>
      </div>

      <label htmlFor="inquiry-message">Project details</label>
      <textarea id="inquiry-message" name="message" value={input.message} maxLength={1500} rows={5} required placeholder="What would you like to install, improve or repair?" aria-invalid={!!errors.message} aria-describedby={describedBy("message", "message-help")} onChange={e => change("message", e.target.value)} />{error("message")}
      <p className="field-hint" id="message-help">Up to 1,500 characters. Please leave out sensitive documents and payment details.</p>

      {mode === "send" && state.status === "not-saved" && <div role="alert" className="form-alert">We couldn’t save your inquiry. Nothing you typed has been lost: please try again in a moment, or {directly}</div>}
      {mode === "send" && state.status === "rate-limited" && <div role="alert" className="form-alert">You’ve sent several inquiries recently. Please wait a while before sending another, or {directly}</div>}
      {Object.values(errors).some(Boolean) && <p role="alert" className="field-error">{mode === "whatsapp" ? "Check the highlighted fields before preparing your message." : "Check the highlighted fields before sending."}</p>}

      <div className="form-actions">
        <button className="button" type="submit" disabled={pending}>{pending ? "Sending…" : "Send inquiry to Mias"} <span aria-hidden="true">↗</span></button>
        {ready && <button type="button" className="text-button" onClick={prepareWhatsApp}>Prepare WhatsApp message</button>}
      </div>
      <span className="visually-hidden" aria-live="polite">{pending ? "Sending your inquiry" : ""}</span>
      <p className="privacy-note">We use these details only to reply to your inquiry. <a href="/privacy">Privacy notice</a></p>
    </form>
    {prepared && whatsapp && <section className="message-preview" aria-label="Prepared WhatsApp message">
      <p role="status"><strong>Nothing has been sent yet.</strong></p><p>Review your message, then send it from WhatsApp.</p>
      <pre>{prepared}</pre><a className="button" href={whatsapp.href} rel="noopener noreferrer">Open WhatsApp to send <span aria-hidden="true">↗</span></a>
    </section>}
  </div>;
}
