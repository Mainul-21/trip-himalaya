import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const loader = readFileSync(new URL("../client/src/components/JourneyLoader.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
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
    expect(home).toContain("reviews.reduce");
    expect(home).toContain("REAL JOURNEYS. HONEST STORIES.");
    expect(home).toContain("published guest");
    expect(home).toContain('agency?.reviewCtaEnabled === false ? "" : googleReviewsUrl');
    expect(home).not.toContain("Google certified");
    expect(home).not.toContain("Google recommended");
    expect(home).not.toContain("Google #1");
    expect(home).not.toContain("AggregateRating");
  });

  it("routes conversion through Plan Your Trip, keeps WhatsApp, and removes phone actions from the homepage", () => {
    expect(layout).toContain('const planHref = isHomepage ? "#plan" : "/#plan"');
    expect(layout).toContain("PLAN YOUR TRIP");
    expect(layout).toContain("!isHomepage ? <a href={phoneHref}");
    expect(layout).toContain("CHAT ON WHATSAPP");
    expect(layout).toContain("Hello, I would like to know more about your Dharamshala tour packages.");
    expect(layout).toContain("safe-area-inset-bottom");
    expect(layout).toContain("rounded-full bg-accent");
    expect(home).toContain('scrollToSection("plan")');
    expect(home).not.toContain("CALL NOW");
    expect(home).not.toContain("tel:");
    expect(layout).toContain("WhatsAppIcon");
    expect(styles).toContain("whatsapp-breathe");
  });

  it("implements factual on-page and crawl SEO without unsupported review schema", () => {
    expect(home).toContain('"@type": "TravelAgency"');
    expect(home).toContain('name: "Dharamshala"');
    expect(home).toContain('name: "Himachal Pradesh"');
    expect(home).toContain("Best Tour Agency in Dharamshala, India | Trip Himalaya");
    expect(seo).toContain('canonical.href = `${window.location.origin}${window.location.pathname}`');
    expect(seo).toContain('application/ld+json');
    expect(indexHtml).toContain("Dharamshala tour packages");
    expect(robots).toContain("Disallow: /admin/recover");
    expect(robots).toContain("Sitemap: https://himalayatrip-ahqqbylp.manus.space/sitemap.xml");
    expect(sitemap).not.toContain("/reviews");
    expect(`${home}\n${seo}`).not.toContain("AggregateRating");
    expect(viteConfig).toContain("manualChunks(id)");
    expect(viteConfig).toContain('return "react-vendor"');
    expect(viteConfig).toContain('return "data-vendor"');
  });
});
