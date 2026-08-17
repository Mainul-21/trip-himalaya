import { createRequire } from "node:module";

// `vercel:build` emits this self-contained CommonJS file. Keeping the API
// entrypoint independent of ../server avoids Vercel omitting that directory
// from the serverless function's runtime bundle.
const require = createRequire(import.meta.url);
const { createApp } = require("./_bundle.cjs") as typeof import("../server/_core/app");

// Vercel detects this default export as the backend function for /api/*.
const app = createApp();

export default app;
