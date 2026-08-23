import { describe, expect, it } from "vitest";
import { aboutReasons, aboutServices } from "../client/src/lib/aboutContent";

describe("concise About page content", () => {
  it("keeps the four owner-approved offerings and reasons to choose the agency", () => {
    expect(aboutServices).toHaveLength(4);
    expect(aboutReasons).toHaveLength(4);
    expect(aboutServices.every(point => point.title.length > 0 && point.copy.length > 0)).toBe(true);
    expect(aboutReasons.every(point => point.title.length > 0 && point.copy.length > 0)).toBe(true);
    expect(aboutServices.map(point => point.title)).toEqual(["Guided treks", "Cultural & sightseeing tours", "Adventure activities", "Stays & custom travel planning"]);
    expect(aboutReasons.map(point => point.title)).toEqual(["Local expertise", "Tailored itineraries", "Diverse experiences", "End-to-end assistance"]);
  });
});
