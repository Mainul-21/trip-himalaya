import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const aboutPage = readFileSync(resolve(projectRoot, "client/src/pages/PublicPage.tsx"), "utf8");
const aboutContent = readFileSync(resolve(projectRoot, "client/src/lib/aboutContent.ts"), "utf8");

describe("Trip Himalaya About Us page", () => {
  it("keeps the existing About route personalized to the confirmed business", () => {
    expect(aboutPage).toContain("About Trip Himalaya");
    expect(aboutPage).toContain("founded in 2020 by Ravi Kant");
    expect(aboutPage).toContain("Meet the founder");
    expect(aboutPage).toContain("Ravi Kant founded Trip Himalaya");
    expect(aboutPage).toContain("Dhauladhar mountains near Dharamshala");
  });

  it("covers the confirmed services and avoids unsupported achievement claims", () => {
    for (const phrase of ["Trekking journeys", "Spiritual and Himachal tours", "Camping and village experiences", "Custom tours", "Safety and clear details", "Comfort with honest pricing", "Personal support"]) {
      expect(aboutContent).toContain(phrase);
    }
    for (const unsupported of ["Google rating", "customers", "awards", "certification", "offices"]) {
      expect(aboutPage.toLowerCase()).not.toContain(unsupported.toLowerCase());
      expect(aboutContent.toLowerCase()).not.toContain(unsupported.toLowerCase());
    }
  });
});
