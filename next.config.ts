import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Verification can use a separate build directory alongside the normal local preview.
  distDir: process.env.MIAS_BUILD_DIR ?? ".next",
  poweredByHeader: false,
  devIndicators: false,
  // PGlite loads its WebAssembly files from node_modules at runtime, so it must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Enables forbidden() and app/forbidden.tsx for real 403 responses (spec 007, ROLE-02).
  experimental: { authInterrupts: true, serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
