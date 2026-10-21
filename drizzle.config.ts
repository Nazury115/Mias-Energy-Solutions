import { defineConfig } from "drizzle-kit";

// `pnpm db:generate` turns changes in the schema into a new versioned SQL migration in ./drizzle.
export default defineConfig({ dialect: "postgresql", schema: "./src/server/db/schema.ts", out: "./drizzle" });
