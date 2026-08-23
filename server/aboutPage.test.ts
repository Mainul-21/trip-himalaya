import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const aboutPage = readFileSync(resolve(projectRoot, "client/src/pages/PublicPage.tsx"), "utf8");
const aboutContent = readFileSync(resolve(projectRoot, "client/src/lib/aboutContent.ts"), "utf8");

describe("Trip Himalaya About Us page", () => {
  it("keeps the existing About route personalized to the owner-provided Dharamshala business copy", () => {
    expect(aboutPage).toContain("About Trip Himalaya");
    expect(aboutPage).toContain("isLegacyStory");
    expect(aboutPage).toContain("Welcome to Trip Himalaya");
    expect(aboutPage).toContain("heart of Dharamshala, Himachal Pradesh");
    expect(aboutPage).toContain("Our core offerings");
    expect(aboutPage).toContain("Why travel with us");
    expect(aboutPage).toContain("Dharamshala, Himachal Pradesh, India");
    expect(aboutPage).toContain("+91 82196 28359");
    expect(aboutPage).toContain("triphimalayainfo@gmail.com");
    expect(aboutPage).toContain("Dhauladhar mountains near Dharamshala");
  });

  it("covers the confirmed trekking, cultural, adventure, and planning details without unsupported achievement claims", () => {
    for (const phrase of ["Triund, Kareri Lake, Thatharna", "Dharamshala monasteries", "Bir Billing paragliding", "Local expertise", "Tailored itineraries", "Diverse experiences", "End-to-end assistance"]) {
      expect(aboutContent).toContain(phrase);
    }
    for (const unsupported of ["Google rating", "customers", "awards", "certification", "offices"]) {
      expect(aboutPage.toLowerCase()).not.toContain(unsupported.toLowerCase());
      expect(aboutContent.toLowerCase()).not.toContain(unsupported.toLowerCase());
    }
  });
});
