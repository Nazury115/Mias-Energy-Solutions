"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { deleteInquiry } from "@/server/inquiries";

const development = () => process.env.NODE_ENV === "development";

/** Turns a development failure switch on or off for this browser only (DEV-02). */
export async function setSimulation(formData: FormData) {
  if (!development()) return;
  const value = formData.get("simulate");
  const jar = await cookies();
  if (value === "db-failure" || value === "notify-failure") jar.set("mias-simulate", value, { path: "/", sameSite: "lax", httpOnly: true });
  else jar.delete("mias-simulate");
  revalidatePath("/dev/inbox");
}

export async function removeInquiry(formData: FormData) {
  if (!development()) return;
  const reference = formData.get("reference");
  if (typeof reference === "string") await deleteInquiry(reference);
  revalidatePath("/dev/inbox");
}
