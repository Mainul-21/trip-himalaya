type ImageVariant = "card" | "hero";

type Variants = Record<ImageVariant, string>;

const MANAGED_VARIANTS: Record<string, Variants> = {
  "/manus-storage/dhauladhar-hut-panorama_c5effca1.jpg": {
    card: "/manus-storage/dhauladhar-hut-panorama-card_80577092.webp",
    hero: "/manus-storage/dhauladhar-hut-panorama-hero_405ee366.webp",
  },
  "/manus-storage/triund-trek-unsplash_2dd49872.jpg": {
    card: "/manus-storage/triund-trek-card_ca8a30e8.webp",
    hero: "/manus-storage/triund-trek-hero_30871768.webp",
  },
  "/manus-storage/triund-lake-unsplash_d755f9cf.jpg": {
    card: "/manus-storage/triund-lake-card_559a8f16.webp",
    hero: "/manus-storage/triund-lake-hero_dbb37e02.webp",
  },
  "/manus-storage/dhauladhar-dharamshala_8ddd37f7.jpg": {
    card: "/manus-storage/dhauladhar-dharamshala-card_3a096aa7.webp",
    hero: "/manus-storage/dhauladhar-dharamshala-hero_e2f71456.webp",
  },
  "/manus-storage/dharamshala-valley_971eee0a.jpg": {
    card: "/manus-storage/dharamshala-valley-card_93ae710f.webp",
    hero: "/manus-storage/dharamshala-valley-hero_cdc7a7b7.webp",
  },
  "/manus-storage/triund-hikers_7653a06a.jpg": {
    card: "/manus-storage/triund-hikers-card_e9833476.webp",
    hero: "/manus-storage/triund-hikers-hero_9a9d289c.webp",
  },
  "/manus-storage/triund-camp_ded436f5.jpg": {
    card: "/manus-storage/triund-camp-card_07fcb674.webp",
    hero: "/manus-storage/triund-camp-hero_aa198b11.webp",
  },
  "/manus-storage/dharamshala-prayer-flags_26329188.jpg": {
    card: "/manus-storage/dharamshala-prayer-flags-card_ddd9ba84.webp",
    hero: "/manus-storage/dharamshala-prayer-flags-hero_4bdac25a.webp",
  },
};

/**
 * Keep administrator-uploaded URLs untouched, while common published Himachal
 * photos use a deliberately smaller WebP file for the visible component.
 */
export function getImageVariant(source: string, variant: ImageVariant) {
  return MANAGED_VARIANTS[source]?.[variant] ?? source;
}
