import { createApp } from "../server/_core/index";

// Vercel keeps the original /api/* request path for this catch-all function,
// allowing the Express tRPC middleware to receive /api/trpc unchanged.
const app = createApp();

export default app;
