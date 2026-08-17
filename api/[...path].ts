import { createRequire } from "node:module";

// See api/index.ts. The bundle is explicitly included with each Vercel
// function so nested /api/* routes can load the shared Express app at runtime.
const require = createRequire(import.meta.url);
const { createApp } = require("./_bundle.cjs") as typeof import("../server/_core/app");

// Vercel keeps the original /api/* request path for this catch-all function,
// allowing the Express tRPC middleware to receive /api/trpc unchanged.
const app = createApp();

export default app;
