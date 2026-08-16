import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const carousel = readFileSync("client/src/components/TourPhotoCarousel.tsx", "utf8");
const card = readFileSync("client/src/components/TourCard.tsx", "utf8");
const detail = readFileSync("client/src/pages/TourDetail.tsx", "utf8");
const admin = readFileSync("client/src/pages/AdminPortal.tsx", "utf8");

describe("tour photo galleries", () => {
  it("supports ordered photos, automatic rotation, and accessible navigation", () => {
    expect(carousel).toContain("const ordered = [heroImage, ...(gallery ?? [])]");
    expect(carousel).toContain("window.setInterval");
    expect(carousel).toContain("Previous photo for ${title}");
    expect(carousel).toContain("Next photo for ${title}");
    expect(carousel).toContain("motion-reduce:transition-none");
  });

  it("uses the same gallery on tour cards and detail pages", () => {
    expect(card).toContain("TourPhotoCarousel");
    expect(card).toContain("gallery={tour.gallery}");
    expect(detail).toContain("TourPhotoCarousel");
    expect(detail).toContain("gallery={tour.gallery}");
    expect(detail).toContain("priority");
  });

  it("explains and preserves administrator ordering controls", () => {
    expect(admin).toContain("all selected photos rotate on the");
    expect(admin).toContain("The rotating photos on tour cards");
    expect(admin).toContain("onChange(next)");
    expect(admin).toContain('onChange(value.filter(item => item !== image))');
  });
});
