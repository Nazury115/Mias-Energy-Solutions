"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteInquiry } from "@/server/inquiries";
import { createInvitation } from "@/server/team";

const development = () => process.env.NODE_ENV === "development";

/** Turns a development failure switch on or off for this browser only (DEV-02). */
export async function setSimulation(formData: FormData) {
  if (!development()) return;
  const value = formData.get("simulate");
  const jar = await cookies();
  if (["db-failure", "notify-failure", "email-failure"].includes(String(value))) jar.set("mias-simulate", String(value), { path: "/", sameSite: "lax", httpOnly: true });
  else jar.delete("mias-simulate");
  revalidatePath("/dev/inbox");
}

export async function removeInquiry(formData: FormData) {
  if (!development()) return;
  const reference = formData.get("reference");
  if (typeof reference === "string") await deleteInquiry(reference);
  revalidatePath("/dev/inbox");
}

/** Development-only stand-in for `pnpm users:create-owner`, which can't run while the website holds the database. */
export async function createOwnerInvitation(formData: FormData) {
  if (!development()) return;
  const name = String(formData.get("name") ?? "").trim().slice(0, 80), email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) redirect("/dev/inbox?owner-invite=invalid");
  const url = await createInvitation({ name, email, role: "owner", invitedBy: null });
  redirect(`/dev/inbox?owner-invite=${encodeURIComponent(url)}`);
}
