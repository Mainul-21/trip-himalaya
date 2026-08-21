export const heroSlides = [
  { src: "/manus-storage/hero_2fda290f.jpg" },
  { src: "/manus-storage/dharamshala-valley_971eee0a.jpg" },
  { src: "/manus-storage/triund-hikers_7653a06a.jpg" },
] as const;

export function getNextHeroSlideIndex(currentIndex: number, totalSlides: number = heroSlides.length) {
  if (totalSlides <= 1) return 0;
  return (Math.max(0, currentIndex) + 1) % totalSlides;
}
