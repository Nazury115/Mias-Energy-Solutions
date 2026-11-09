import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Verification can use a separate build directory alongside the normal local preview.
  distDir: process.env.MIAS_BUILD_DIR ?? ".next",
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        // Hide paths/query tokens without nulling the Origin on native form POSTs.
        { key: "Referrer-Policy", value: "strict-origin" },
      ],
    }];
  },
  devIndicators: false,
  // PGlite loads its WebAssembly files from node_modules at runtime, so it must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Enables forbidden() and app/forbidden.tsx for real 403 responses (spec 007, ROLE-02).
  experimental: { authInterrupts: true, serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
