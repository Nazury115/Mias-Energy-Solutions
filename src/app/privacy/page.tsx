import type { Metadata } from "next";
import { business } from "@/content/site";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata("Privacy notice | Mias Energy Solutions", "How Mias Energy Solutions uses the details you send with an inquiry, how long they are kept and how to ask for them to be deleted.", "/privacy");

// Draft wording (spec 006, PRIV-01): marked as a draft until Mias Energy Solutions approves it.
const sections = [
  ["What we collect", "When you send an inquiry: your name, your phone number and/or email address, how you would like us to reply, the service and project area you choose, and the details you write. To stop spam we also keep a one-way coded version of your network address, which cannot be turned back into the address."],
  ["Why we collect it", "Only to reply to your inquiry and discuss the work you asked about. We do not sell your details or add you to marketing lists."],
  ["Earlier request details", "If you previously supplied appliance ratings or usage details, these remain part of your original inquiry. Mias staff and contacts explicitly invited to the resulting job can view those saved details. They do not confirm equipment suitability or an installation price."],
  ["Request notifications", "If you supply an email address, we use it to confirm receipt and acceptance. A phone-only request receives an on-screen reference. During local development these messages are captured on this computer. No real messages are sent. Your preferred reply method is separate and tells Israel how you would like him to follow up."],
  ["Your jobs and messages", "After Mias accepts work, staff can invite you to view your job using a secure email link. You see the progress and shared messages for jobs you can access. When a message appears on screen in your focused portal tab, its sender can see your display name and the time of your first view. Internal staff notes remain private. Job changes and access changes record who made them and when. Progress updates appear in the portal."],
  ["If you create an account", "Your name, email address and (if you add it) phone number; your password, stored only in scrambled one-way form that nobody at Mias can read; and, for each signed-in session, the time, network address and browser type, so we can keep your account secure. Changes made by Mias staff to staff accounts are recorded with who made them and when."],
  ["Who sees it", "Israel Masauso and Mias staff handle inquiries. On accepted jobs, each invited contact can see that job’s customer-visible history, messages and files, including items shared before they joined. Staff can revoke an individual contact or remove a shared file. During local testing, use fictional documents and photos."],
  ["How long we keep it", "Until Mias Energy Solutions deletes it. You can ask us to delete your details at any time. (A fixed retention period will be confirmed before this website goes live.)"],
  ["Closing your account", `You can update your name and phone number on your account page. To close your account, contact Israel on ${business.phoneDisplay} or ${business.contacts.email}; we will delete your sign-in details.`],
  ["Seeing, correcting or deleting your details", `Contact Israel on ${business.phoneDisplay} or ${business.contacts.email} with your inquiry reference, and we will show, correct or delete what we hold.`],
  ["WhatsApp messages", "If you choose “Prepare WhatsApp message”, nothing is sent to this website. Your message goes through WhatsApp, under WhatsApp’s own terms."],
  ["Cookies", "When you sign in, the website sets only the cookies needed to keep you signed in; they end when you sign out or the session expires. It does not use advertising or tracking cookies."],
] as const;

export default function Privacy() {
  return <main id="main-content" tabIndex={-1}>
    <section className="site-container page-intro" data-reveal><p className="eyebrow">PRIVACY NOTICE</p><h1>How we use<br /><span className="blue-text">your details.</span></h1>
      <p className="notice">Draft notice: awaiting approval by {business.name} before the website goes live.</p></section>
    <section className="site-container story-sections section-bottom">{sections.map(([heading, text]) => <article key={heading}><h2>{heading}</h2><p>{text}</p></article>)}</section>
  </main>;
}
