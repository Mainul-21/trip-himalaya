import { describe, expect, it } from "vitest";
import { applySecurityHeaders, PUBLIC_BODY_LIMIT } from "./httpSecurity";

describe("HTTP security policy", () => {
  it("uses a conservative request body limit and applies protective headers", () => {
    const headers = new Map<string, string>();
    applySecurityHeaders({ setHeader: (name, value) => headers.set(name, value) }, true);
    expect(PUBLIC_BODY_LIMIT).toBe("1mb");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Strict-Transport-Security")).toBe("max-age=31536000; includeSubDomains");
  });
});
