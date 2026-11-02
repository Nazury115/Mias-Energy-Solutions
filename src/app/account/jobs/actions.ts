"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireViewer } from "@/server/session";
import { uploadForm } from "@/server/job-file-form";
import { addJobMessage, JobProblem } from "@/server/jobs";
import type { JobFormState } from "@/app/staff/jobs/actions";

export async function customerMessage(_previous: JobFormState, form: FormData): Promise<JobFormState> {
  const reference = String(form.get("reference") ?? "").slice(0, 80);
  const viewer = await requireViewer(["customer", "staff", "owner"], `/account/jobs/${reference}`);
  try {
    await addJobMessage({ ...viewer, role: "customer" }, reference, String(form.get("body") ?? "").slice(0, 4000), "message", String(form.get("eventKey") ?? "").slice(0, 80));
    revalidatePath(`/account/jobs/${reference}`); revalidatePath(`/staff/jobs/${reference}`);
    return { status: "done", message: "Your message was saved." };
  } catch (error) { unstable_rethrow(error); return { status: "error", message: error instanceof JobProblem ? error.message : "We could not save your message. Please try again.", values: { body: String(form.get("body") ?? "").slice(0, 4000) } }; }
}

export async function customerUpload(_previous: JobFormState, form: FormData) {
  const viewer = await requireViewer(["customer", "owner", "staff"], "/account");
  return uploadForm({ ...viewer, role: "customer" }, form);
}
