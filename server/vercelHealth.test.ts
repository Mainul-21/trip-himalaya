import { describe, expect, it, vi } from "vitest";
import health from "../api/health";

describe("Vercel health endpoint", () => {
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
