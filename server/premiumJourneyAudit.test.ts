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
    expect(home).toContain("DISCOVER HIMACHAL.");
    expect(home).toContain("EXPERIENCE THE HIMALAYAS.");
    expect(home).toContain("Curated journeys. Local expertise. Unforgettable memories.");
    expect(home).toContain("Choose your perfect experience");
    expect(home).toContain("Based on published Trip Himalaya reviews");
    expect(home).toContain("PLAN YOUR HIMACHAL TRIP");
    expect(home).toContain("WhatsApp Number");
    expect(home).toContain("Destination / Places");
    expect(home).toContain("cat-trekking_0c532a80.jpg");
    expect(home).toContain("trpc.tours.list.useQuery");
    expect(home).toContain("const categories = fallbackTripStyles");
    expect(home).not.toContain("500+ Google Reviews");
    for (const label of ["TREKKING", "SPIRITUAL TOURS", "CAMPING", "VILLAGE EXPERIENCES", "HIMACHAL TOURS", "CUSTOM TOURS"]) {
      expect(home).toContain(`title: "${label}"`);
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
    for (const phrase of ["tour.duration", "tour.difficulty", "/person", "VIEW DETAILS", "ENQUIRE NOW"]) {
      expect(card).toContain(phrase);
    }
  });
});
