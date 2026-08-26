import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const home = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const tours = readFileSync(resolve(projectRoot, "client/src/pages/Tours.tsx"), "utf8");
const search = readFileSync(resolve(projectRoot, "client/src/pages/SearchPage.tsx"), "utf8");
const detail = readFileSync(resolve(projectRoot, "client/src/pages/TourDetail.tsx"), "utf8");
const card = readFileSync(resolve(projectRoot, "client/src/components/TourCard.tsx"), "utf8");
const styles = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");

describe("premium journey presentation", () => {
  it("keeps the homepage grounded and exposes all requested travel styles", () => {
    expect(home).toContain("DISCOVER HIMACHAL.");
    expect(home).toContain("EXPERIENCE THE HIMALAYAS.");
    expect(home).toContain("Curated journeys. Local expertise. Unforgettable memories.");
    expect(home).toContain("Choose your perfect experience");
    expect(home).toContain("REAL JOURNEYS. HONEST STORIES.");
    expect(home).not.toContain("verifiedAverage");
    expect(home).not.toContain("reviews.reduce");
    expect(home).not.toContain("item.rating");
    expect(home).not.toContain("<Stars");
    expect(home).not.toContain("Average from {reviews.length}");
    expect(home).toContain("const homepageFigures = [");
    expect(home).toContain('value: agency?.touristCount?.trim() || ""');
    expect(home).toContain('value: agency?.tourCount?.trim() || ""');
    expect(home).toContain("homepageFigures.length ?");
    expect(home).toContain("AT A GLANCE");
    expect(home).toContain("VIEW INDEPENDENT FEEDBACK");
    expect(home).toContain('ref={reviewCarouselRef}');
    expect(home).toContain('aria-label="Scrollable traveller stories"');
    expect(home).toContain('reviews.map(item =>');
    expect(home).toContain('snap-x snap-mandatory');
    expect(home).toContain('overscroll-x-contain');
    expect(home).toContain('w-full shrink-0 snap-start rounded-xl sm:w-[19rem]');
    expect(home).toContain('carousel.addEventListener("pointerdown", stop)');
    expect(home).toContain("PLAN YOUR HIMACHAL TRIP");
    expect(home).toContain('function scrollToSection(sectionId: "packages" | "plan")');
    expect(home).toContain('scrollToSection("packages")');
    expect(home).toContain('scrollToSection("plan")');
    expect(home).toContain('id="packages" className="scroll-mt-20');
    expect(home).toContain("VIEW ALL PACKAGES");
    expect(home).toContain('Link href="/tours"');
    expect(home).toContain('id="plan" className="scroll-mt-20');
    expect(home).toContain("WhatsApp Number");
    expect(home).toContain('placeholder="Date"');
    expect(home).toContain('type={dateFieldFocused ? "date" : "text"}');
    expect(home).toContain("Destination / Places");
    expect(home).toContain("cat-trekking_07d114b2.jpg");
    expect(home).toContain("cat-spiritual_743c5681.jpg");
    expect(home).toContain("cat-camping_c447f997.jpg");
    expect(home).toContain("cat-village_f7870b29.jpg");
    expect(home).toContain("cat-tours_8d0fd3d0.jpg");
    expect(home).toContain("cat-custom_9ca90b70.jpg");
    expect(home).toContain('getImageVariant(item.image, "card")} alt={item.title.toLowerCase()} width={640} height={512} loading="lazy" decoding="async" className="h-28 w-full rounded-sm object-cover"');
    expect(home).not.toContain('loading="eager" fetchPriority="high" decoding="async" className="h-28 w-full rounded-sm object-cover"');
    expect(home).toContain("trpc.tours.list.useQuery");
    expect(home).toContain("const categories = fallbackTripStyles");
    expect(home).not.toContain("500+ Google Reviews");
    expect(home).not.toContain("Google verified");
    for (const label of ["TREKKING", "SPIRITUAL TOURS", "CAMPING", "VILLAGE EXPERIENCES", "HIMACHAL TOURS", "CUSTOM TOURS"]) {
      expect(home).toContain(`title: "${label}"`);
    }
  });

  it("uses the shared Montserrat heading system below the approved homepage hero", () => {
    expect(styles).toContain('--font-display: "Montserrat", "Poppins", sans-serif;');
    expect(styles).toContain('body { background-color: var(--color-background); color: var(--color-foreground); font-family: "Inter", sans-serif; }');
    expect(styles).toContain('.homepage-hero .font-display { font-family: "Oswald", sans-serif; }');
    expect(home).toContain('<section className="homepage-hero relative">');
  });

  it("keeps tour discovery helpful without exposing local implementation details", () => {
    expect(tours).toContain("Filter trips");
    expect(tours).toContain('label: "All journeys"');
    expect(tours).toContain("We could not load journeys right now.");
    expect(tours).not.toContain("Check your DATABASE_URL");
    expect(search).toContain("Search Triund, Bir, Dharamshala or a trip type");
  });

  it("shows complete, fact-safe detail and card information", () => {
    for (const phrase of ["Overview", "What’s included", "What’s not included", "Important information", "Frequently asked questions.", "Ready to experience Himachal?", "WhatsApp us"]) {
      expect(detail).toContain(phrase);
    }
    for (const phrase of ["tour.duration", "tour.difficulty", "/person", "VIEW DETAILS", "ENQUIRE NOW"]) {
      expect(card).toContain(phrase);
    }
  });
});
