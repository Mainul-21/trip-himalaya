import { createApp } from "../server/_core/index";

// Vercel detects this default export as the backend function for /api/*.
const app = createApp();

export default app;
