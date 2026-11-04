import { readConversation, recordMessageViews } from "@/server/job-conversation";
import { siteUrl } from "@/lib/site-metadata";
import { requireViewer } from "@/server/session";

type Context = { params: Promise<{ reference: string }> };
const headers = { "Cache-Control": "private, no-store" };
const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

async function portalViewer(request: Request, reference: string) {
  if (new URL(request.url).searchParams.get("portal") === "staff") {
    return requireViewer(["owner", "staff"], "/staff/jobs/" + reference);
  }
  const viewer = await requireViewer(["owner", "staff", "customer"], "/account/jobs/" + reference);
  return { ...viewer, role: "customer" as const };
}

export async function GET(request: Request, { params }: Context) {
  const { reference } = await params;
  const viewer = await portalViewer(request, reference);
  return Response.json(await readConversation(reference, viewer), { headers });
}

export async function POST(request: Request, { params }: Context) {
  if (request.headers.get("origin") !== new URL(siteUrl).origin) return new Response(null, { status: 403, headers });
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") return new Response(null, { status: 415, headers });
  const { reference } = await params;
  const viewer = await portalViewer(request, reference);
  const data = await request.json().catch(() => null);
  if (!Array.isArray(data?.ids) || !data.ids.length || data.ids.length > 50 || !data.ids.every((id: unknown) => typeof id === "string" && uuid.test(id))) {
    return new Response(null, { status: 400, headers });
  }
  await recordMessageViews(reference, viewer, data.ids);
  return new Response(null, { status: 204, headers });
}
