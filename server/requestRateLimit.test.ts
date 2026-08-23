import { describe, expect, it, beforeEach } from "vitest";
import { assertRequestAllowed, resetRateLimitsForTests } from "./requestRateLimit";

describe("request rate limits", () => {
  beforeEach(() => resetRateLimitsForTests());

  it("tracks a scoped client key and returns a retry time after the limit", () => {
    const options = { maxRequests: 2, windowMs: 60_000 };
    expect(assertRequestAllowed("public:127.0.0.1", options, 1_000)).toMatchObject({ remaining: 1 });
    expect(assertRequestAllowed("public:127.0.0.1", options, 1_001)).toMatchObject({ remaining: 0 });
    expect(assertRequestAllowed("public:127.0.0.1", options, 1_002)).toMatchObject({ remaining: 0, retryAfterSeconds: 60 });
  });

  it("does not share a budget across scopes", () => {
    const options = { maxRequests: 1, windowMs: 60_000 };
    expect(assertRequestAllowed("public:127.0.0.1", options, 1_000).retryAfterSeconds).toBe(0);
    expect(assertRequestAllowed("admin:127.0.0.1", options, 1_000).retryAfterSeconds).toBe(0);
  });
});
