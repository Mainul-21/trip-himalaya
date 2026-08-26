import fs from 'node:fs';

const homePath = '/home/ubuntu/trip-himalaya-dharamshala/client/src/pages/Home.tsx';
let source = fs.readFileSync(homePath, 'utf8');

function replaceOnce(find, replace, label) {
  if (!source.includes(find)) throw new Error(`Could not find ${label}`);
  source = source.replace(find, replace);
}

replaceOnce(
  'import { FormEvent, useEffect, useMemo, useState } from "react";',
  'import { FormEvent, useEffect, useMemo, useRef, useState } from "react";',
  'React hook import',
);

replaceOnce(
  '  const [dateFieldFocused, setDateFieldFocused] = useState(false);',
  '  const [dateFieldFocused, setDateFieldFocused] = useState(false);\n  const reviewCarouselRef = useRef<HTMLDivElement>(null);',
  'review carousel ref',
);

replaceOnce(
  '  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const timer = window.setInterval(() => setActiveHeroSlide(current => getNextHeroSlideIndex(current, activeHeroSlides.length)), 4000); return () => window.clearInterval(timer); }, [activeHeroSlides.length]);',
  '  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const timer = window.setInterval(() => setActiveHeroSlide(current => getNextHeroSlideIndex(current, activeHeroSlides.length)), 4000); return () => window.clearInterval(timer); }, [activeHeroSlides.length]);\n  useEffect(() => {\n    const carousel = reviewCarouselRef.current;\n    if (!carousel || reviews.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;\n    let timer: number | undefined;\n    const advance = () => {\n      const maxScroll = carousel.scrollWidth - carousel.clientWidth;\n      if (maxScroll <= 4) return;\n      const next = carousel.scrollLeft + Math.max(carousel.clientWidth * 0.86, 240);\n      carousel.scrollTo({ left: next >= maxScroll - 4 ? 0 : next, behavior: "smooth" });\n    };\n    const start = () => { timer = window.setInterval(advance, 5200); };\n    const stop = () => { if (timer !== undefined) window.clearInterval(timer); };\n    const resume = () => { stop(); window.setTimeout(start, 1500); };\n    start();\n    carousel.addEventListener("pointerdown", stop);\n    carousel.addEventListener("pointerup", resume);\n    carousel.addEventListener("pointercancel", resume);\n    carousel.addEventListener("mouseenter", stop);\n    carousel.addEventListener("mouseleave", resume);\n    return () => { stop(); carousel.removeEventListener("pointerdown", stop); carousel.removeEventListener("pointerup", resume); carousel.removeEventListener("pointercancel", resume); carousel.removeEventListener("mouseenter", stop); carousel.removeEventListener("mouseleave", resume); };\n  }, [reviews.length]);',
  'review carousel effect insertion point',
);

replaceOnce(
  '<div className="flex snap-x gap-4 overflow-x-auto pb-2">{reviews.slice(0, 3).map(item =>',
  '<div ref={reviewCarouselRef} aria-label="Scrollable traveller stories" className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-0 pb-3 pt-1 [scrollbar-width:thin]">{reviews.map(item =>',
  'review carousel container',
);

replaceOnce(
  'group w-[min(82vw,21rem)] shrink-0 snap-start rounded-xl',
  'group w-full shrink-0 snap-start rounded-xl sm:w-[19rem]',
  'review card mobile width',
);

replaceOnce(
  'hover:shadow-[0_12px_30px_rgba(18,61,91,.08)] sm:w-[19rem]">',
  'hover:shadow-[0_12px_30px_rgba(18,61,91,.08)]">',
  'review card duplicate desktop width',
);

fs.writeFileSync(homePath, source);
console.log('Refined homepage review carousel.');
