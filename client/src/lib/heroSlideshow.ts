export const heroSlides = [
  { src: "/manus-storage/hero_6ada2982.jpg" },
  { src: "/manus-storage/dharamshala-valley_971eee0a.jpg" },
  { src: "/manus-storage/triund-hikers_7653a06a.jpg" },
] as const;

export function getNextHeroSlideIndex(currentIndex: number, totalSlides = heroSlides.length) {
  if (totalSlides <= 1) return 0;
  return (Math.max(0, currentIndex) + 1) % totalSlides;
}
