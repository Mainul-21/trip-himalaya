import { describe, expect, it } from "vitest";
import { getNextHeroSlideIndex, heroSlides } from "../client/src/lib/heroSlideshow";

describe("homepage hero slideshow", () => {
  it("uses the existing authentic Himachal hero images", () => {
    expect(heroSlides).toHaveLength(3);
    expect(heroSlides.every(slide => slide.src.startsWith("/manus-storage/"))).toBe(true);
  });

  it("advances one slide at a time and wraps after the final slide", () => {
    expect(getNextHeroSlideIndex(0)).toBe(1);
    expect(getNextHeroSlideIndex(heroSlides.length - 1)).toBe(0);
  });

  it("keeps a stable first slide when there is one or no slide", () => {
    expect(getNextHeroSlideIndex(0, 1)).toBe(0);
    expect(getNextHeroSlideIndex(0, 0)).toBe(0);
  });
});
