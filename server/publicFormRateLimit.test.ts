import { describe, expect, it } from "vitest";
import { assertPublicFormSubmissionAllowed, resetPublicFormRateLimitForTests } from "./publicFormRateLimit";

describe("public form rate limiter", () => {
  it("allows a small number of valid requests, blocks bursts, and resets after its window", () => {
    resetPublicFormRateLimitForTests();
    const now = 1_000;
    for (let count = 0; count < 8; count += 1) expect(() => assertPublicFormSubmissionAllowed("enquiry", "visitor@example.com", now + count)).not.toThrow();
    expect(() => assertPublicFormSubmissionAllowed("enquiry", "visitor@example.com", now + 9)).toThrow("Please wait");
    expect(() => assertPublicFormSubmissionAllowed("enquiry", "visitor@example.com", now + 10 * 60 * 1000 + 1)).not.toThrow();
  });
});
