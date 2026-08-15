import { describe, expect, it } from "vitest";
import { formatPublishedJourneyCount } from "../client/src/lib/companyFacts";

describe("company profile journey count", () => {
  it("shows the real current journey count without inventing a customer-performance metric", () => {
    expect(formatPublishedJourneyCount(4)).toBe("4 current journeys");
    expect(formatPublishedJourneyCount(1)).toBe("1 current journey");
    expect(formatPublishedJourneyCount(-2)).toBe("0 current journeys");
  });
});
