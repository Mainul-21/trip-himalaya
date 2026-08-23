import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const home = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const tours = readFileSync(resolve(projectRoot, "client/src/pages/Tours.tsx"), "utf8");
const search = readFileSync(resolve(projectRoot, "client/src/pages/SearchPage.tsx"), "utf8");
const detail = readFileSync(resolve(projectRoot, "client/src/pages/TourDetail.tsx"), "utf8");
const card = readFileSync(resolve(projectRoot, "client/src/components/TourCard.tsx"), "utf8");

describe("premium journey presentation", () => {
  it("keeps the homepage grounded and exposes all requested travel styles", () => {
    expect(home).toContain("DISCOVER HIMACHAL.");
    expect(home).toContain("EXPERIENCE THE HIMALAYAS.");
    expect(home).toContain("Curated journeys. Local expertise. Unforgettable memories.");
    expect(home).toContain("Choose your perfect experience");
    expect(home).toContain("TRAVELLED. REMEMBERED. SHARED.");
    expect(home).toContain("Average from {reviews.length} published guest");
    expect(home).toContain("VIEW GOOGLE REVIEWS");
    expect(home).toContain("PLAN YOUR HIMACHAL TRIP");
    expect(home).toContain('function scrollToSection(sectionId: "packages" | "plan")');
    expect(home).toContain('scrollToSection("packages")');
    expect(home).toContain('scrollToSection("plan")');
    expect(home).toContain('id="packages" className="scroll-mt-20');
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
    expect(home).toContain('loading="eager" fetchPriority="high" decoding="async" className="h-28 w-full rounded-sm object-cover"');
    expect(home).not.toContain('getImageVariant(item.image, "card")} alt={item.title.toLowerCase()} width={640} height={512} loading="lazy"');
    expect(home).toContain("trpc.tours.list.useQuery");
    expect(home).toContain("const categories = fallbackTripStyles");
    expect(home).not.toContain("500+ Google Reviews");
    expect(home).not.toContain("Google verified");
    for (const label of ["TREKKING", "SPIRITUAL TOURS", "CAMPING", "VILLAGE EXPERIENCES", "HIMACHAL TOURS", "CUSTOM TOURS"]) {
      expect(home).toContain(`title: "${label}"`);
    }
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
