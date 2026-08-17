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
  return app;
}

export default createApp;
