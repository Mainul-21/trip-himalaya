import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const loader = readFileSync(new URL("../client/src/components/JourneyLoader.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const tourCard = readFileSync(new URL("../client/src/components/TourCard.tsx", import.meta.url), "utf8");
const seo = readFileSync(new URL("../client/src/components/Seo.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");
const robots = readFileSync(new URL("../client/public/robots.txt", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../client/public/sitemap.xml", import.meta.url), "utf8");
const viteConfig = readFileSync(new URL("../vite.config.ts", import.meta.url), "utf8");

describe("premium public experience contract", () => {
  it("uses an engaging, reduced-motion-respecting non-logo journey loader for lazy public routes", () => {
    expect(app).toContain('import JourneyLoader from "./components/JourneyLoader"');
    expect(app).toContain("<Suspense fallback={<JourneyLoader />}");
    expect(loader).toContain("journey-loader-wheel");
    expect(loader).toContain("Finding the next horizon");
    expect(loader).toContain("Compass");
    expect(loader).not.toContain("OFFICIAL_TRIP_HIMALAYA_LOGO");
    expect(loader).toContain("Preparing your journey");
    expect(styles).toContain("@keyframes journey-wheel");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("keeps authentic feedback on the homepage and removes the separate public reviews destination", () => {
    expect(app).not.toContain('import("./pages/Reviews")');
    expect(app).not.toContain('path="/reviews"');
    expect(home).toContain("trpc.reviews.list.useQuery");
    expect(home).toContain("REAL JOURNEYS. HONEST STORIES.");
    expect(home).toContain('agency?.reviewCtaEnabled === false ? "" : googleReviewsUrl');
    expect(home).not.toContain("verifiedAverage");
    expect(home).not.toContain("reviews.reduce");
    expect(home).not.toContain("item.rating");
    expect(home).not.toContain("<Stars");
    expect(home).not.toContain("Average from {reviews.length}");
    expect(home).not.toContain("published guest");
    expect(home).not.toContain("Google certified");
    expect(home).not.toContain("Google recommended");
    expect(home).not.toContain("Google #1");
    expect(home).not.toContain("AggregateRating");
  });

  it("restores the header Plan Your Trip style, keeps icon-only floating CTAs, and removes phone actions from the homepage", () => {
    expect(layout).toContain('const planHref = isHomepage ? "contact" : "/contact"');
    expect(layout).toContain("PLAN YOUR TRIP");
    expect(layout).toContain("rounded-md bg-[#F56600] px-5 py-2.5");
    expect(layout).toContain("md:inline-flex");
    expect(layout).toContain("!isHomepage ? <a href={phoneHref}");
    expect(layout).toContain('aria-label="Plan your Trip"');
    expect(layout).toContain('aria-label="Chat on WhatsApp"');
    expect(layout).toContain("I want to plan a trip.");
    expect(layout).not.toContain("CHAT ON WHATSAPP");
    expect(layout).toContain("safe-area-inset-bottom");
    expect(layout).toContain("fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-50 flex");
    expect(layout).toContain("grid h-12 w-12 place-items-center rounded-full");
    expect(home).toContain('scrollToSection("plan")');
    expect(home).not.toContain("CALL NOW");
    expect(home).not.toContain("tel:");
    expect(layout).toContain("WhatsAppIcon");
  });

  it("uses the supplied complete Trip Himalaya header logo with an authentic contact-only utility bar", () => {
    expect(indexHtml).toContain("Montserrat:wght@500;600;700;800");
    expect(styles).toContain(".brand-wordmark");
    expect(styles).toContain('font-family: "Montserrat", "Poppins", sans-serif');
    expect(styles).toContain(".brand-tagline");
    expect(layout).toContain('const SUPPLIED_COMPLETE_HEADER_LOGO = "/manus-storage/trip-himalaya-complete-logo_9a359425.jpg"');
    expect(layout).toContain('src={SUPPLIED_COMPLETE_HEADER_LOGO}');
    expect(layout).toContain('width={210} height={77}');
    expect(layout).toContain('lg:w-[210px]');
    expect(layout).toContain("Based in Himachal Pradesh");
    expect(layout).toContain("profile.phone");
    expect(layout).toContain("profile.email");
    expect(layout).not.toContain("1200+ Reviews");
    expect(layout).not.toContain("4.9/5");
    expect(layout).toContain('bg-white/95');
    expect(layout).toContain("backdrop-blur-xl");
    expect(layout).toContain("border-b border-[#0D2C5B]/10");
    expect(layout).toContain("PLAN YOUR TRIP");
  });

  it("keeps the hero prioritized while deferred cards use optimized asynchronous image delivery", () => {
    expect(home).toContain('fetchPriority="high"');
    expect(home).toContain('loading="lazy" decoding="async"');
    expect(tourCard).toContain('getImageVariant(tour.heroImage, "card")');
    expect(tourCard).toContain('loading="lazy" decoding="async"');
  });

  it("implements factual on-page and crawl SEO without unsupported review schema", () => {
    expect(home).toContain('"@type": "TravelAgency"');
    expect(home).toContain('name: "Dharamshala"');
    expect(home).toContain('name: "Himachal Pradesh"');
    expect(home).toContain("Trip Himalaya | Best Tour Agency in Dharamshala, India");
    expect(seo).toContain('canonical.href = `${window.location.origin}${window.location.pathname}`');
    expect(seo).toContain('application/ld+json');
    expect(indexHtml).toContain("Dharamshala tour packages");
    expect(robots).not.toContain("/admin/recover");
    expect(robots).toContain("Sitemap: https://himalayatrip-ahqqbylp.manus.space/sitemap.xml");
    expect(sitemap).not.toContain("/reviews");
    expect(`${home}\n${seo}`).not.toContain("AggregateRating");
    expect(viteConfig).toContain("manualChunks(id)");
    expect(viteConfig).toContain('return "react-vendor"');
    expect(viteConfig).toContain('return "data-vendor"');
  });
});
