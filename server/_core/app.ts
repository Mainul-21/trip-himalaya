import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { applySecurityHeaders, PUBLIC_BODY_LIMIT } from "../httpSecurity";

/**
 * Creates the API-only Express application shared by local, managed, and
 * Vercel runtimes. Keeping this module free of Vite imports lets Vercel build
 * a compact self-contained serverless bundle.
 */
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    applySecurityHeaders(res, process.env.NODE_ENV === "production");
    next();
  });
  app.use(express.json({ limit: PUBLIC_BODY_LIMIT }));
  app.use(express.urlencoded({ limit: PUBLIC_BODY_LIMIT, extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
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
    res.status(404).type("application/json").json({
      error: "API endpoint not found",
      path: req.originalUrl,
    });
  });
  return app;
}

export default createApp;
