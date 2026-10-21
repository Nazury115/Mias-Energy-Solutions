import type { Metadata } from "next";
import { business } from "@/content/site";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata("Privacy notice | Mias Energy Solutions", "How Mias Energy Solutions uses the details you send with an inquiry, how long they are kept and how to ask for them to be deleted.", "/privacy");

// Draft wording (spec 006, PRIV-01): marked as a draft until Mias Energy Solutions approves it.
const sections = [
  ["What we collect", "When you send an inquiry: your name, your phone number and/or email address, how you would like us to reply, the service and project area you choose, and the details you write. To stop spam we also keep a one-way coded version of your network address, which cannot be turned back into the address."],
  ["Why we collect it", "Only to reply to your inquiry and discuss the work you asked about. We do not sell your details or add you to marketing lists."],
  ["Who sees it", "Israel Masauso and the Mias Energy Solutions staff who handle inquiries."],
  ["How long we keep it", "Until Mias Energy Solutions deletes it. You can ask us to delete your details at any time. (A fixed retention period will be confirmed before this website goes live.)"],
  ["Seeing, correcting or deleting your details", `Contact Israel on ${business.phoneDisplay} or ${business.contacts.email} with your inquiry reference, and we will show, correct or delete what we hold.`],
  ["WhatsApp messages", "If you choose “Prepare WhatsApp message”, nothing is sent to this website. Your message goes through WhatsApp, under WhatsApp’s own terms."],
  ["Cookies", "This website does not use advertising or tracking cookies."],
] as const;

export default function Privacy() {
  return <main id="main-content" tabIndex={-1}>
    <section className="site-container page-intro" data-reveal><p className="eyebrow">PRIVACY NOTICE</p><h1>How we use<br /><span className="blue-text">your details.</span></h1>
      <p className="notice">Draft notice: awaiting approval by {business.name} before the website goes live.</p></section>
    <section className="site-container story-sections section-bottom">{sections.map(([heading, text]) => <article key={heading}><h2>{heading}</h2><p>{text}</p></article>)}</section>
  </main>;
}
