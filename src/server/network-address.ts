import { isIP } from "node:net";

export function networkAddress(headers: Pick<Headers, "get">): string {
  // The loopback development suite models separate visitors with forwarded addresses.
  if (process.env.NODE_ENV === "development") {
    return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
  }
  if (process.env.MIAS_TRUST_PROXY !== "true") return "local";
  const address = headers.get("x-real-ip")?.trim();
  return address && isIP(address) ? address : "local";
}
