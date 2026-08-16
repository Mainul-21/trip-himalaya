import { describe, expect, it } from "vitest";
import { aboutReasons, aboutServices } from "../client/src/lib/aboutContent";

describe("concise About page content", () => {
  it("keeps four clear services and four clear reasons to choose the agency", () => {
    expect(aboutServices).toHaveLength(4);
    expect(aboutReasons).toHaveLength(4);
    expect(aboutServices.every(point => point.title.length > 0 && point.copy.length > 0)).toBe(true);
    expect(aboutReasons.every(point => point.title.length > 0 && point.copy.length > 0)).toBe(true);
  });
});
