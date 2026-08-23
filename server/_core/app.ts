import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { applySecurityHeaders, isSecureRequest, PUBLIC_BODY_LIMIT } from "../httpSecurity";
import { rateLimitMiddleware } from "../requestRateLimit";

/**
 * Creates the API-only Express application shared by local, managed, and
 * Vercel runtimes. Keeping this module free of Vite imports lets Vercel build
 * a compact self-contained serverless bundle.
 */
export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production" && req.headers.host && !isSecureRequest(req)) {
      res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
      return;
    }
    applySecurityHeaders(res, process.env.NODE_ENV === "production");
    next();
  });
  app.use(express.json({ limit: PUBLIC_BODY_LIMIT }));
  app.use(express.urlencoded({ limit: PUBLIC_BODY_LIMIT, extended: true }));
  app.use("/api", rateLimitMiddleware({ scope: "api", maxRequests: 240, windowMs: 10 * 60 * 1000 }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.get("/api/health", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ ok: true, service: "trip-himalaya-api" });
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // API-shaped requests must never fall through to the Vite/SPA HTML shell.
  // A stale local process or an incorrect API path should surface as JSON instead
  // of causing the browser's tRPC client to report an HTML parsing error.
  app.use("/api", (req, res) => {
    res.status(404).type("application/json").json({ error: "API endpoint not found" });
  });
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (res.headersSent) return;
    const status = typeof error === "object" && error && "status" in error && typeof error.status === "number"
      ? Math.min(Math.max(error.status, 400), 500)
      : 500;
    res.status(status).type("application/json").json({ error: status >= 500 ? "Request could not be processed." : "Invalid request." });
  });
  return app;
}

export default createApp;
