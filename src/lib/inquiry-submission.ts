// Rules for the "Send inquiry to Mias" form, used by the server and exercised directly by pytest through Node.
import { inquiryServices } from "./inquiry.ts";

export const replyMethods = { whatsapp: "WhatsApp", phone: "Phone call", email: "Email" } as const;
export type ReplyMethod = keyof typeof replyMethods;

export type InquirySubmissionInput = {
  name: string; phone: string; email: string; preferredReply: string; service: string; area: string; message: string;
};
export type InquirySubmission = {
  name: string; phone: string | null; email: string | null; preferredReply: ReplyMethod; service: string; area: string | null; message: string;
};
export type InquirySubmissionErrors = Partial<Record<keyof InquirySubmissionInput, string>>;
export type InquirySubmissionResult = { ok: true; value: InquirySubmission } | { ok: false; errors: InquirySubmissionErrors };

/** Zambian local (0977 123 456), 260…, 00… and +… forms become +E.164; anything else is null. */
export function normalizePhone(raw: string): string | null {
  const compact = raw.trim().replace(/[\s().-]/g, "");
  if (!/^\+?\d+$/.test(compact)) return null;
  let digits: string;
  if (compact.startsWith("+")) digits = compact.slice(1);
  else if (compact.startsWith("00")) digits = compact.slice(2);
  else if (compact.startsWith("0") && compact.length === 10) digits = `260${compact.slice(1)}`;
  else if (compact.startsWith("260") && compact.length === 12) digits = compact;
  else return null;
  return digits.length >= 9 && digits.length <= 15 && !digits.startsWith("0") ? `+${digits}` : null;
}

/** Spaces a stored Zambian number for reading (+260977123456 → +260 977 123 456); other numbers are unchanged. */
export function displayPhone(phone: string): string {
  return /^\+260\d{9}$/.test(phone) ? `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7, 10)} ${phone.slice(10)}` : phone;
}

export function countLinks(text: string): number {
  return (text.match(/\bhttps?:\/\/|\bwww\./gi) ?? []).length;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateInquirySubmission(input: InquirySubmissionInput): InquirySubmissionResult {
  const name = input.name.trim(), area = input.area.trim(), message = input.message.trim();
  const email = input.email.trim().toLowerCase(), rawPhone = input.phone.trim();
  const phone = rawPhone ? normalizePhone(rawPhone) : null;
  const errors: InquirySubmissionErrors = {};

  if (!name) errors.name = "Enter your name.";
  else if (name.length > 80) errors.name = "Use 80 characters or fewer for your name.";
  if (!rawPhone && !email) errors.phone = "Give a phone number or an email address so Israel can reply.";
  else if (rawPhone && !phone) errors.phone = "Enter a phone number such as 0977 123 456 or +260 977 123 456.";
  if (email && (email.length > 254 || !emailPattern.test(email))) errors.email = "Enter an email address such as name@example.com.";
  if (!Object.hasOwn(replyMethods, input.preferredReply)) errors.preferredReply = "Choose how Israel should reply.";
  else if (input.preferredReply === "email" && !email) errors.preferredReply = "Add your email address, or choose WhatsApp or a phone call.";
  else if (input.preferredReply !== "email" && !rawPhone) errors.preferredReply = "Add your phone number, or choose email.";
  if (!Object.hasOwn(inquiryServices, input.service)) errors.service = "Choose a listed service.";
  if (area.length > 120) errors.area = "Use 120 characters or fewer for the area.";
  if (!message) errors.message = "Describe the help you need.";
  else if (message.length > 1500) errors.message = "Use 1,500 characters or fewer for the project details.";
  else if (countLinks(message) > 3) errors.message = "Please include no more than 3 links.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, phone, email: email || null, preferredReply: input.preferredReply as ReplyMethod, service: input.service, area: area || null, message } };
}

// Crockford base32: no I, L, O or U, so references are easy to read aloud and type.
const referenceAlphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** e.g. MES-26-7K3QP; `values` are five numbers from 0 to 31 (random in use, fixed in tests). */
export function formatReference(year: number, values: number[]): string {
  return `MES-${String(year % 100).padStart(2, "0")}-${values.map(value => referenceAlphabet[value]).join("")}`;
}
