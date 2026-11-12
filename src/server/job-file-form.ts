import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { uploadJobFile } from "@/server/job-files";
import { FileProblem } from "@/server/validate-job-file";
import type { Viewer } from "@/server/session";
import type { JobFormState } from "@/app/staff/jobs/actions";

export function fileSaved(reference: string, message: string): JobFormState {
  revalidatePath(`/account/jobs/${reference}`);
  revalidatePath(`/staff/jobs/${reference}`);
  return { status: "done", message };
}

export function fileFailed(error: unknown): JobFormState {
  unstable_rethrow(error);
  return { status: "error", message: error instanceof FileProblem ? error.message : "The file change could not be saved. Please try again." };
}

export async function uploadForm(viewer: Viewer, form: FormData): Promise<JobFormState> {
  const reference = String(form.get("reference"));
  try {
    const file = form.get("file");
    if (!(file instanceof File)) throw new FileProblem("Choose a file to upload.");
    await uploadJobFile(viewer, reference, String(form.get("submission")), file, form.get("shareInChat") === "yes");
    return fileSaved(reference, "File shared with this job.");
  } catch (error) { return fileFailed(error); }
}
