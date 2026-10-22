import { getViewer } from "@/server/session";

export const dynamic = "force-dynamic";

// Lets the (static) header show "Sign in" or the account links without making every page dynamic (STAFF-02).
export async function GET() {
  const viewer = await getViewer();
  return Response.json(viewer ? { name: viewer.name, role: viewer.role } : null, { headers: { "Cache-Control": "no-store" } });
}
