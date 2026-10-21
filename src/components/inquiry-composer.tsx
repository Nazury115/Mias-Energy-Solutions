"use client";
import { useEffect, useRef, useState } from "react";
import { business } from "@/content/site";
import { getContactLinks } from "@/lib/contact-links";
import { inquiryServices, prepareInquiry, type InquiryInput, type InquiryErrors } from "@/lib/inquiry";

export function InquiryComposer({ initialService }: { initialService: string }) {
  const [input, setInput] = useState<InquiryInput>({ name: "", service: initialService, area: "", message: "" });
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [prepared, setPrepared] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const change = (field: keyof InquiryInput, value: string) => {
    setInput(current => ({ ...current, [field]: value })); setPrepared(null);
    setErrors(current => ({ ...current, [field]: undefined }));
  };
  const error = (field: keyof InquiryInput) => errors[field] ? <p className="field-error" id={`${field}-error`}>{errors[field]}</p> : null;
  const whatsapp = prepared ? getContactLinks(business.contacts, prepared).find(link => link.kind === "whatsapp") : null;
  return <div className="inquiry-card">
    <p className="eyebrow">START WITH A FEW DETAILS</p><h2>Tell us what you need.</h2>
    <p className="muted">Prepare your message here, then open WhatsApp to send it directly to Israel. These details are not saved on this website.</p>
    <form ref={form} noValidate onSubmit={event => {
      event.preventDefault(); const result = prepareInquiry(input);
      if (!result.ok) {
        setErrors(result.errors); setPrepared(null);
        form.current?.querySelector<HTMLElement>(`[name="${Object.keys(result.errors)[0]}"]`)?.focus();
      } else { setErrors({}); setPrepared(result.message); }
    }}>
      <div className="form-grid">
        <div><label htmlFor="inquiry-name">Your name</label><input id="inquiry-name" name="name" autoComplete="name" value={input.name} maxLength={80} required aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} onChange={e => change("name", e.target.value)} />{error("name")}</div>
        <div><label htmlFor="inquiry-service">Service</label><select id="inquiry-service" name="service" value={input.service} aria-invalid={!!errors.service} aria-describedby={errors.service ? "service-error" : undefined} onChange={e => change("service", e.target.value)}>{Object.entries(inquiryServices).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select>{error("service")}</div>
      </div>
      <label htmlFor="inquiry-area">Project area <span>(optional)</span></label><input id="inquiry-area" name="area" value={input.area} maxLength={120} placeholder="For example, Lusaka" aria-invalid={!!errors.area} aria-describedby={errors.area ? "area-error" : undefined} onChange={e => change("area", e.target.value)} />{error("area")}
      <label htmlFor="inquiry-message">Project details</label><textarea id="inquiry-message" name="message" value={input.message} maxLength={1500} rows={5} required placeholder="What would you like to install, improve or repair?" aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : "message-help"} onChange={e => change("message", e.target.value)} />{error("message")}
      <p className="field-hint" id="message-help">Up to 1,500 characters. Please leave out sensitive documents and payment details.</p>
      {Object.values(errors).some(Boolean) && <p role="alert" className="field-error">Check the highlighted fields before preparing your message.</p>}
      <button className="button" type="submit" disabled={!ready}>Prepare WhatsApp message <span aria-hidden="true">↗</span></button>
      <noscript><p>Enable JavaScript to prepare a message, or use the direct phone, email and WhatsApp links.</p></noscript>
    </form>
    {prepared && whatsapp && <section className="message-preview" aria-label="Prepared WhatsApp message">
      <p role="status"><strong>Nothing has been sent yet.</strong></p><p>Review your message, then send it from WhatsApp.</p>
      <pre>{prepared}</pre><a className="button" href={whatsapp.href} rel="noopener noreferrer">Open WhatsApp to send <span aria-hidden="true">↗</span></a>
    </section>}
  </div>;
}
