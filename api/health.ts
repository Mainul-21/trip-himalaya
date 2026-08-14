import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Lightweight Vercel deployment check. It intentionally has no database,
 * authentication, or Manus-runtime dependency, so it confirms that Vercel is
 * serving the current repository and its API directory correctly.
 */
export default function health(_request: IncomingMessage, response: ServerResponse) {
  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify({ ok: true, service: "trip-himalaya-api" }));
}
