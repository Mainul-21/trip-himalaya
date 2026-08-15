import { describe, expect, it } from "vitest";
import { aboutReasons, aboutServices } from "../client/src/lib/aboutContent";

describe("concise About page content", () => {
  it("keeps exactly three clear services and three clear reasons to choose the agency", () => {
    expect(aboutServices).toHaveLength(3);
    expect(aboutReasons).toHaveLength(3);
    expect(aboutServices.every(point => point.title.length > 0 && point.copy.length > 0)).toBe(true);
    expect(aboutReasons.every(point => point.title.length > 0 && point.copy.length > 0)).toBe(true);
  });
});
