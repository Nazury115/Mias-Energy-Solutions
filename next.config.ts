import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // PGlite loads its WebAssembly files from node_modules at runtime, so it must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Enables forbidden() and app/forbidden.tsx for real 403 responses (spec 007, ROLE-02).
  experimental: { authInterrupts: true },
};

export default nextConfig;
