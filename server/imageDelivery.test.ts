import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getImageVariant, LEGACY_MANUS_MEDIA_ORIGIN, resolveImageUrl } from "../client/src/lib/imageDelivery";

const carousel = readFileSync("client/src/components/TourPhotoCarousel.tsx", "utf8");
const card = readFileSync("client/src/components/TourCard.tsx", "utf8");
const home = readFileSync("client/src/pages/Home.tsx", "utf8");
const admin = readFileSync("client/src/pages/AdminPortal.tsx", "utf8");
const upload = readFileSync("client/src/lib/imageUpload.ts", "utf8");

describe("image delivery", () => {
  const triundSource = "/manus-storage/triund-trek-unsplash_2dd49872.jpg";

  it("selects purpose-sized WebP derivatives for common published images", () => {
    expect(getImageVariant(triundSource, "card")).toBe(`${LEGACY_MANUS_MEDIA_ORIGIN}/manus-storage/triund-trek-card_ca8a30e8.webp`);
    expect(getImageVariant(triundSource, "hero")).toBe(`${LEGACY_MANUS_MEDIA_ORIGIN}/manus-storage/triund-trek-hero_30871768.webp`);
    expect(getImageVariant("https://cdn.example.com/admin-upload.jpg", "card")).toBe("https://cdn.example.com/admin-upload.jpg");
  });

  it("resolves stored managed-storage paths through the stable public media origin", () => {
    expect(resolveImageUrl(triundSource)).toBe(`${LEGACY_MANUS_MEDIA_ORIGIN}${triundSource}`);
    expect(resolveImageUrl("https://cdn.example.com/admin-upload.jpg")).toBe("https://cdn.example.com/admin-upload.jpg");
  });

  it("keeps the supplied package cards compact while detail galleries request the appropriate size", () => {
    expect(card).toContain('className="h-40 w-full object-cover"');
    expect(card).toContain('getImageVariant(tour.heroImage, "card")');
    expect(card).toContain('loading="lazy" decoding="async"');
    expect(carousel).toContain("getImageVariant(activePhoto, compact ? \"card\" : \"hero\")");
    expect(carousel).toContain('sizes={compact ? "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" : "100vw"}');
  });

  it("loads only the active homepage slideshow image at first paint", () => {
    expect(home).toContain('const activeHeroSlides = useMemo(() => agency?.heroImages?.length ? agency.heroImages.map(src => ({ src })) : heroSlides');
    expect(home).toContain("const activeHero = activeHeroSlides[activeHeroSlide] || activeHeroSlides[0]");
    expect(home).toContain('src={getImageVariant(activeHero.src, "hero")}');
    expect(home).not.toContain("{heroSlides.map((slide, index) => <img");
  });

  it("compresses new administrator uploads before they reach public tour cards", () => {
    expect(admin).toContain("prepareImageUpload");
    expect(admin).toContain("automatically resized and converted to fast WebP");
    expect(upload).toContain('canvas.toBlob');
    expect(upload).toContain('"image/webp"');
    expect(upload).toContain("maxInputBytes");
  });
});
