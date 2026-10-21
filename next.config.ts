import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // PGlite loads its WebAssembly files from node_modules at runtime, so it must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
