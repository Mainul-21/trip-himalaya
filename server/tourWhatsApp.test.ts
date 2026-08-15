import { describe, expect, it } from "vitest";
import { buildTourWhatsAppMessage } from "../client/src/lib/tourWhatsApp";

describe("tour WhatsApp enquiry message", () => {
  it("names and summarises the selected journey for the administrator", () => {
    const message = decodeURIComponent(buildTourWhatsAppMessage({
      title: "Triund Sunrise Trek",
      location: "McLeod Ganj, Dharamshala",
      duration: "2 Days / 1 Night",
      difficulty: "Easy–Moderate",
      shortDescription: "A sunrise trek with local route support.",
      priceFrom: 2499,
    }));

    expect(message).toContain("Tour: Triund Sunrise Trek");
    expect(message).toContain("McLeod Ganj, Dharamshala · 2 Days / 1 Night · Easy–Moderate");
    expect(message).toContain("About: A sunrise trek with local route support.");
    expect(message).toContain("Starting from: ₹2,499 per person");
  });
});
