import { describe, expect, it } from "vitest";
import { assertRequestAllowed, resetRateLimitsForTests } from "./requestRateLimit";

describe("public form rate limiter", () => {
  it("allows a small number of valid requests, blocks bursts, and resets after its window", () => {
    resetRateLimitsForTests();
    const now = 1_000;
    const options = { maxRequests: 8, windowMs: 10 * 60 * 1000 };
    for (let count = 0; count < 8; count += 1) expect(assertRequestAllowed("enquiry:127.0.0.1:visitor@example.com", options, now + count).retryAfterSeconds).toBe(0);
    expect(assertRequestAllowed("enquiry:127.0.0.1:visitor@example.com", options, now + 9)).toMatchObject({ remaining: 0, retryAfterSeconds: 600 });
    expect(assertRequestAllowed("enquiry:127.0.0.1:visitor@example.com", options, now + 10 * 60 * 1000 + 1).retryAfterSeconds).toBe(0);
  });
});
