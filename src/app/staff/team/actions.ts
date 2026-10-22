"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireViewer } from "@/server/session";
import { cancelInvitation, changePerson, createInvitation } from "@/server/team";

export type InviteFormState = { status: "idle" } | { status: "error"; errors: Record<string, string>; values: Record<string, string> } | { status: "done"; email: string };

const read = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.slice(0, 254) : "";
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Every action re-checks that the caller is an active Owner on the server (ROLE-02), whatever the page showed.
export async function invitePerson(_previous: InviteFormState, formData: FormData): Promise<InviteFormState> {
  const owner = await requireViewer(["owner"], "/staff/team");
  const values = { name: read(formData, "name").trim(), email: read(formData, "email").trim().toLowerCase(), role: read(formData, "role") };
  const errors: Record<string, string> = {};
  if (!values.name || values.name.length > 80) errors.name = "Enter their name (80 characters or fewer).";
  if (!emailPattern.test(values.email)) errors.email = "Enter an email address such as name@example.com.";
  if (values.role !== "staff" && values.role !== "owner") errors.role = "Choose Staff or Owner.";
  if (Object.keys(errors).length) return { status: "error", errors, values };
  await createInvitation({ name: values.name, email: values.email, role: values.role as "staff" | "owner", invitedBy: { id: owner.id, name: owner.name } });
  revalidatePath("/staff/team");
  return { status: "done", email: values.email };
}

export async function cancelInvite(formData: FormData) {
  const owner = await requireViewer(["owner"], "/staff/team");
  await cancelInvitation(owner.id, read(formData, "invitationId"));
  revalidatePath("/staff/team");
}

/** Role and status changes; a refusal (e.g. the last active Owner) comes back as a message on the team page. */
export async function updatePerson(formData: FormData) {
  const owner = await requireViewer(["owner"], "/staff/team");
  const role = read(formData, "role"), status = read(formData, "status");
  const problem = await changePerson(owner, read(formData, "userId"), {
    ...(role === "customer" || role === "staff" || role === "owner" ? { role } : {}),
    ...(status === "active" || status === "deactivated" ? { status } : {}),
  });
  revalidatePath("/staff/team");
  if (problem) redirect(`/staff/team?problem=${encodeURIComponent(problem)}`);
}
