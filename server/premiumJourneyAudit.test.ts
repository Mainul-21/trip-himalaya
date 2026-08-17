import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const home = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const tours = readFileSync(resolve(projectRoot, "client/src/pages/Tours.tsx"), "utf8");
const search = readFileSync(resolve(projectRoot, "client/src/pages/SearchPage.tsx"), "utf8");
const detail = readFileSync(resolve(projectRoot, "client/src/pages/TourDetail.tsx"), "utf8");
const card = readFileSync(resolve(projectRoot, "client/src/components/TourCard.tsx"), "utf8");

describe("premium journey presentation", () => {
  it("keeps the homepage grounded and exposes all requested travel styles", () => {
    expect(home).toContain("Discover Himachal.");
    expect(home).toContain("Experience the Himalayas.");
    expect(home).toContain("Curated journeys. Local expertise. Unforgettable memories.");
    expect(home).toContain("Pick a style to find a journey that fits.");
    for (const label of ["Trekking", "Culture & Local", "Adventure", "Short Breaks", "Best Sellers", "Custom Plan"]) {
      expect(home).toContain(`title: \"${label}\"`);
    }
  });

  it("keeps tour discovery helpful without exposing local implementation details", () => {
    expect(tours).toContain("Filter trips");
    expect(tours).toContain('label: "All journeys"');
    expect(tours).toContain("We could not load journeys right now.");
    expect(tours).not.toContain("Check your DATABASE_URL");
    expect(search).toContain("Search Triund, Bir, Dharamshala or a trip type");
  });

  it("shows complete, fact-safe detail and card information", () => {
    for (const phrase of ["Overview", "What’s included", "What’s not included", "Important information", "Frequently asked questions.", "Ready to experience Himachal?", "WhatsApp us"]) {
      expect(detail).toContain(phrase);
    }
    for (const phrase of ["tour.location", "tour.duration", "tour.difficulty", "per person", "View details", "WhatsApp"]) {
      expect(card).toContain(phrase);
    }
  });
});
