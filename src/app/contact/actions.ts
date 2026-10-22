"use server";
import { cookies, headers } from "next/headers";
import type { InquirySubmissionErrors, InquirySubmissionInput, ReplyMethod } from "@/lib/inquiry-submission";
import { formReady } from "@/server/form-token";
import { submitInquiry, type Simulation } from "@/server/inquiries";
import { getViewer } from "@/server/session";

export type InquiryFormState =
  | { status: "idle" }
  | { status: "received" | "saved-unnotified"; reference: string; name: string; preferredReply: ReplyMethod; contact: string; values: InquirySubmissionInput }
  | { status: "invalid"; errors: InquirySubmissionErrors; values: InquirySubmissionInput }
  | { status: "rate-limited" | "not-saved"; values: InquirySubmissionInput };

/** Server side of "Send inquiry to Mias"; also handles plain form posts when JavaScript is off (INQ-05). */
export async function sendInquiry(_previous: InquiryFormState, formData: FormData): Promise<InquiryFormState> {
  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.slice(0, 4000) : "";
  };
  const values: InquirySubmissionInput = {
    name: field("name"), phone: field("phone"), email: field("email"), preferredReply: field("preferredReply"),
    service: field("service"), area: field("area"), message: field("message"),
  };
  if (!formReady()) return { status: "not-saved", values };
  const requestHeaders = await headers();
  const networkAddress = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "local";
  const switchValue = process.env.NODE_ENV === "development" ? (await cookies()).get("mias-simulate")?.value : undefined;
  const simulate: Simulation = switchValue === "db-failure" || switchValue === "notify-failure" ? switchValue : null;

  const outcome = await submitInquiry(
    { fields: values, honeypot: field("mias_check"), formToken: field("formToken"), idempotencyKey: field("idempotencyKey"), sourcePath: "/contact" },
    { networkAddress, simulate, userId: (await getViewer())?.id ?? null },
  );
  return { ...outcome, values };
}
