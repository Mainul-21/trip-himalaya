import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import health from "../api/health";

const vercelConfig = readFileSync(new URL("../vercel.json", import.meta.url), "utf8");

describe("Vercel health endpoint", () => {
  it("routes API requests to the serverless entrypoint before the SPA fallback", () => {
    expect(vercelConfig).toContain('"source": "/api/:path*"');
    expect(vercelConfig).toContain('"destination": "/api"');
    expect(vercelConfig).toContain('"source": "/:path((?!api(?:/|$)).*)"');
  });

  it("returns a no-cache success response without depending on database configuration", () => {
    const response = {
      statusCode: 0,
      setHeader: vi.fn(),
      end: vi.fn(),
    };

    health({} as never, response as never);

    expect(response.statusCode).toBe(200);
    expect(response.setHeader).toHaveBeenCalledWith("Content-Type", "application/json; charset=utf-8");
    expect(response.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(response.end).toHaveBeenCalledWith(JSON.stringify({ ok: true, service: "trip-himalaya-api" }));
  });
});
