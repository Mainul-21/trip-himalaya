import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const loader = readFileSync(new URL("../client/src/components/JourneyLoader.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");
const reviews = readFileSync(new URL("../client/src/pages/Reviews.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const seo = readFileSync(new URL("../client/src/components/Seo.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");
const robots = readFileSync(new URL("../client/public/robots.txt", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../client/public/sitemap.xml", import.meta.url), "utf8");
const viteConfig = readFileSync(new URL("../vite.config.ts", import.meta.url), "utf8");

describe("premium public experience contract", () => {
  it("uses a branded, reduced-motion-respecting journey loader for lazy public routes", () => {
    expect(app).toContain('import JourneyLoader from "./components/JourneyLoader"');
    expect(app).toContain("<Suspense fallback={<JourneyLoader />}");
    expect(loader).toContain("journey-loader-wheel");
    expect(loader).toContain("Preparing your journey");
    expect(styles).toContain("@keyframes journey-wheel");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("provides a dedicated feedback route that shows only published review data and an honest external destination", () => {
    expect(app).toContain('const Reviews = lazy(() => import("./pages/Reviews"))');
    expect(app).toContain('<Route path="/reviews" component={Reviews} />');
    expect(reviews).toContain("trpc.reviews.list.useQuery");
    expect(reviews).toContain("reviews.reduce");
    expect(reviews).toContain("published guest");
    expect(reviews).toContain("agency?.reviewCtaEnabled === false ? \"\" : agency?.googleMapsUrl?.trim()");
    expect(reviews).toContain("does not claim Google verification or endorsement");
    expect(reviews).not.toContain("Google certified");
    expect(reviews).not.toContain("Google recommended");
    expect(reviews).not.toContain("Google #1");
    expect(reviews).not.toContain("AggregateRating");
  });

  it("keeps premium direct-call, WhatsApp, and quote paths using the approved business contacts", () => {
    expect(layout).toContain("CALL NOW");
    expect(layout).toContain("GET A QUOTE");
    expect(layout).toContain("CHAT ON WHATSAPP");
    expect(layout).toContain("Hello, I would like to know more about your Dharamshala tour packages.");
    expect(layout).toContain("safe-area-inset-bottom");
    expect(layout).toContain("hidden flex-col items-end gap-2 lg:flex");
    expect(layout).toContain("> WHATSAPP</");
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
    expect(sitemap).toContain("https://himalayatrip-ahqqbylp.manus.space/reviews");
    expect(`${home}\n${reviews}\n${seo}`).not.toContain("AggregateRating");
    expect(viteConfig).toContain("manualChunks(id)");
    expect(viteConfig).toContain('return "react-vendor"');
    expect(viteConfig).toContain('return "data-vendor"');
  });
});
