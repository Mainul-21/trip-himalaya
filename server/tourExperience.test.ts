import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const adminSource = readFileSync(new URL("../client/src/pages/AdminPortal.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const toursSource = readFileSync(new URL("../client/src/pages/Tours.tsx", import.meta.url), "utf8");
const cardSource = readFileSync(new URL("../client/src/components/TourCard.tsx", import.meta.url), "utf8");

describe("tour Best Seller and trip-style experience", () => {
  it("keeps Best Seller status under administrator control and visible on public cards", () => {
    expect(adminSource).toContain("Show Best Seller badge");
    expect(adminSource).toContain("isBestSeller: false");
    expect(cardSource).toContain("tour.isBestSeller");
    expect(cardSource).toContain("Best Seller");
  });

  it("offers clear home-page trip styles and matching working catalogue filters", () => {
    expect(homeSource).toContain("Why choose Trip Himalaya");
    expect(homeSource).toContain("/tours?style=short-breaks");
    expect(homeSource).toContain("/tours?style=best-sellers");
    expect(toursSource).toContain("Short breaks");
    expect(toursSource).toContain("Best sellers");
    expect(toursSource).toContain("filterMatches");
  });
});
