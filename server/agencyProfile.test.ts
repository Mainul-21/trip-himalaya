import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const db = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const portal = readFileSync(new URL("../client/src/pages/AdminPortal.tsx", import.meta.url), "utf8");
const publicPage = readFileSync(new URL("../client/src/pages/PublicPage.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const publicLayout = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const dashboardLayout = readFileSync(new URL("../client/src/components/DashboardLayout.tsx", import.meta.url), "utf8");
const sidebarPrimitive = readFileSync(new URL("../client/src/components/ui/sidebar.tsx", import.meta.url), "utf8");
const dashboardSkeleton = readFileSync(new URL("../client/src/components/DashboardLayoutSkeleton.tsx", import.meta.url), "utf8");
const adminLogin = readFileSync(new URL("../client/src/pages/AdminLogin.tsx", import.meta.url), "utf8");
const journeyLoader = readFileSync(new URL("../client/src/components/JourneyLoader.tsx", import.meta.url), "utf8");

describe("agency profile administration contract", () => {
  it("persists one structured public profile with logo, contact, and social profile fields", () => {
    expect(schema).toContain('agencyProfiles = mysqlTable("agencyProfiles"');
    expect(schema).toContain('instagramUrl: varchar("instagramUrl"');
    expect(schema).toContain('googleMapsUrl: varchar("googleMapsUrl"');
    expect(db).toContain("DEFAULT_AGENCY_PROFILE");
    expect(db).toContain("updateAgencyProfile");
    expect(schema).toContain('travelStylesJson: text("travelStylesJson")');
    expect(db).toContain("JSON.stringify(travelStyles)");
    expect(db).toContain("DEFAULT_TRAVEL_STYLES");
    expect(db).toContain("schemaNeedsUpdate");
    expect(db).toContain("databaseNeedsAttention");
    expect(db).toContain("using safe fallback");
    expect(db).toContain("isMissingAgencyBrandingColumn");
    expect(db).toContain("touristCount|tourCount|thirdMetricLabel|thirdMetricValue");
    expect(db).toContain("googleMapsUrl: agencyProfiles.googleMapsUrl");
    expect(schema).toContain('touristCount: varchar("touristCount"');
    expect(schema).toContain('tourCount: varchar("tourCount"');
    expect(schema).toContain('thirdMetricLabel: varchar("thirdMetricLabel"');
    expect(schema).toContain('thirdMetricValue: varchar("thirdMetricValue"');
    expect(schema).toContain('experiencesTitle: varchar("experiencesTitle"');
    expect(schema).toContain('experiencesJson: text("experiencesJson")');
    expect(schema).toContain('aboutStoryTitle: varchar("aboutStoryTitle"');
    expect(schema).toContain('heroTitle: varchar("heroTitle"');
    expect(schema).toContain('heroImagesJson: text("heroImagesJson")');
    expect(schema).toContain('heroBadgesJson: text("heroBadgesJson")');
    expect(schema).toContain('whyTripItemsJson: text("whyTripItemsJson")');
    expect(db).toContain("DEFAULT_EXPERIENCES");
    expect(db).toContain("JSON.stringify(experiences)");
    expect(db).toContain('export type ExperienceItem = { title: string; copy: string; href: string; image: string }');
    expect(db).toContain('experiencesTitle: "Stay close to the mountains."');
    expect(db).toContain('phone: "+918219628359"');
    expect(db).toContain('whatsapp: "918219628359"');
    expect(db).toContain('heroTitle: "DISCOVER HIMACHAL."');
    expect(db).toContain('whyTripTitle: "WHY TRIP HIMALAYA?"');
    expect(db).toContain('JSON.stringify(heroImages)');
    expect(db).toContain('JSON.stringify(heroBadges)');
    expect(db).toContain('JSON.stringify(whyTripItems)');
  });

  it("keeps public reads open and restricts profile updates to authenticated administrators", () => {
    expect(router).toContain("agency: router({");
    expect(router).toContain("get: publicProcedure.query(() => db.getAgencyProfile())");
    expect(router).toContain("update: adminProcedure.input(agencyProfileInput)");
  });

  it("provides clear portal controls for logo, contact, and social profile updates", () => {
    expect(portal).toContain('view === "agency"');
    expect(portal).toContain('title="Agency profile"');
    expect(portal).toContain("Save public agency profile");
    expect(portal).toContain("Public profiles");
    expect(portal).toContain('name="exploreTitle"');
    expect(portal).toContain('name="exploreIntro"');
    expect(portal).toContain('name="travelStyles"');
    expect(portal).toContain('>Travel styles</h2>');
    expect(portal).toContain('Edit each card directly. Upload a relevant Himalayan image');
    expect(portal).toContain('function AgencyImageUploader');
    expect(portal).toContain('trpc.media.upload.useMutation');
    expect(portal).toContain('Upload image');
    expect(portal).toContain('value={JSON.stringify(travelStyles)}');
    expect(portal).toContain('name="touristCount"');
    expect(portal).toContain('name="tourCount"');
    expect(portal).toContain('name="thirdMetricLabel"');
    expect(portal).toContain('name="thirdMetricValue"');
    expect(portal).toContain("retry: false");
    expect(portal).toContain("One safe local database update is needed");
    expect(portal).toContain("Connect the local database to edit this profile");
    expect(portal).toContain("databaseNeedsAttention");
    expect(portal).toContain("Try again");
    expect(portal).toContain(">Our Stay</h2>");
    expect(portal).toContain('function addHotel()');
    expect(portal).toContain('function removeHotel(index: number)');
    expect(portal).toContain('label="Hotel image"');
    expect(portal).toContain("Hotel booking or website link");
    expect(portal).toContain(">Add hotel</Button>");
    expect(portal).toContain("About page — Our Story");
    expect(portal).toContain('name="experiencesTitle"');
    expect(portal).toContain('name="aboutStoryTitle"');
    expect(portal).toContain('>Homepage hero</h2>');
    expect(portal).toContain('name="heroTitle"');
    expect(portal).toContain('name="heroAccentTitle"');
    expect(portal).toContain('name="heroSubtitle"');
    expect(portal).toContain('>Add hero photo</Button>');
    expect(portal).toContain('>Homepage trust messages</h2>');
    expect(portal).toContain('>Why Trip Himalaya</h2>');
    expect(portal).toContain('name="whyTripTitle"');
  });

  it("renders administrator-managed Our Stay hotel cards and Our Story content publicly with official-logo loading fallback", () => {
    expect(publicPage).toContain("agencyProfile?.aboutStoryTitle");
    expect(publicPage).toContain("agencyProfile?.experiencesTitle");
    expect(publicPage).toContain("agencyProfile?.experiences");
    expect(publicPage).toContain('eyebrow="Our Stay"');
    expect(publicPage).toContain('getImageVariant(image, "card")');
    expect(publicPage).toContain('target="_blank"');
    expect(publicPage).toContain("View hotel");
    expect(router).toContain('Enter a full http:// or https:// hotel link.');
    expect(router).toContain('image: z.string().trim().url().or(z.string().startsWith("/manus-storage/"))');
    expect(publicLayout).toContain('{ label: "OUR STAY", href: "/experiences", dropdown: true }');
    expect(app).toContain("JourneyLoader");
    expect(journeyLoader).toContain("OFFICIAL_TRIP_HIMALAYA_LOGO");
  });

  it("renders administrator-managed homepage hero, slideshow, trust messages, and Why Trip Himalaya cards with safe fallbacks", () => {
    expect(home).toContain('agency?.heroTitle || "DISCOVER HIMACHAL."');
    expect(home).toContain('agency?.heroAccentTitle || "EXPERIENCE THE HIMALAYAS."');
    expect(home).toContain('agency?.heroSubtitle || "Curated journeys. Local expertise. Unforgettable memories."');
    expect(home).toContain('agency?.heroImages?.length ? agency.heroImages.map(src => ({ src })) : heroSlides');
    expect(home).toContain('agency?.heroBadges?.length ? agency.heroBadges : fallbackHeroBadges');
    expect(home).toContain('agency?.whyTripItems?.length ? agency.whyTripItems : fallbackWhyTripItems');
    expect(home).toContain('agency?.whyTripTitle || "WHY TRIP HIMALAYA?"');
  });

  it("uses a valid, premium traveller score and an administrator-controlled Google Reviews destination", () => {
    expect(home).toContain('<span className="text-3xl font-bold text-accent">{verifiedAverage.toFixed(1)}</span>');
    expect(home).toContain("const googleReviewsUrl = agency?.googleMapsUrl?.trim();");
    expect(home).toContain("VIEW GOOGLE REVIEWS");
    expect(home).not.toContain('<p className="mt-4 flex items-center gap-2 text-2xl font-bold text-accent">{verifiedAverage.toFixed(1)} <Stars rating={verifiedAverage} /></p>');
    expect(portal).toContain("Google Reviews / Business Profile URL");
    expect(portal).toContain("does not create, copy, or claim a Google rating or verification badge");
  });

  it("persists configurable review presentation safely without creating unverified Google claims", () => {
    expect(schema).toContain('reviewSectionTitle: varchar("reviewSectionTitle"');
    expect(schema).toContain('reviewSectionIntro: varchar("reviewSectionIntro"');
    expect(schema).toContain('reviewCtaLabel: varchar("reviewCtaLabel"');
    expect(schema).toContain('reviewCtaEnabled: boolean("reviewCtaEnabled"');
    expect(router).toContain('const authenticReviewCopy = z.string().trim().min(2).max(500).refine');
    expect(router).toContain('reviewSectionTitle: authenticReviewCopy.max(160)');
    expect(router).toContain('reviewSectionIntro: authenticReviewCopy');
    expect(router).toContain('reviewCtaLabel: z.string().trim().min(2).max(80).refine');
    expect(router).toContain('reviewCtaEnabled: z.boolean()');
    expect(db).toContain('reviewSectionTitle: "TRAVELLED. REMEMBERED. SHARED."');
    expect(db).toContain('reviewCtaLabel: "VIEW GOOGLE REVIEWS"');
    expect(home).toContain('agency?.reviewSectionTitle || "TRAVELLED. REMEMBERED. SHARED."');
    expect(home).toContain('agency?.reviewCtaEnabled === false ? "" : googleReviewsUrl');
    expect(portal).toContain('name="reviewSectionTitle"');
    expect(portal).toContain('name="reviewSectionIntro"');
    expect(portal).toContain('name="reviewCtaLabel"');
    expect(portal).toContain('name="reviewCtaEnabled"');
    expect(home).not.toContain("Google verified");
  });

  it("allows a blank short tagline and uses the shared official logo fallback on public and administrator surfaces", () => {
    expect(router).toContain("tagline: z.string().trim().max(220)");
    expect(portal).toContain('label="Short tagline (optional)"');
    expect(portal).not.toContain('name="tagline" defaultValue={data.tagline} required');
    expect(publicLayout).toContain("OFFICIAL_TRIP_HIMALAYA_LOGO");
    expect(publicLayout).toContain("{profile.tagline &&");
    expect(dashboardLayout).toContain("OFFICIAL_TRIP_HIMALAYA_LOGO");
    expect(dashboardSkeleton).toContain("OFFICIAL_TRIP_HIMALAYA_LOGO");
    expect(adminLogin).toContain("OFFICIAL_TRIP_HIMALAYA_LOGO");
  });

  it("keeps every administrator navigation option visible by default and reachable from the phone navigation trigger", () => {
    expect(dashboardLayout).toContain("<SidebarProvider defaultOpen className=");
    expect(dashboardLayout).toContain('collapsible="offcanvas"');
    expect(dashboardLayout).toContain('aria-label="Open administration navigation"');
    expect(dashboardLayout).toContain('[--sidebar:#123d5b] [--sidebar-foreground:#fff]');
    expect(sidebarPrimitive).toContain('className={cn("bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden", className)}');
    expect(sidebarPrimitive).toContain('className={cn("bg-sidebar text-sidebar-foreground group-data-[variant=floating]');
    expect(dashboardLayout).toContain('label: "Tours & placement"');
    expect(dashboardLayout).toContain('label: "Photo library"');
    expect(dashboardLayout).toContain('label: "Booking requests"');
    expect(dashboardLayout).toContain('label: "Enquiries"');
    expect(dashboardLayout).toContain('label: "Public agency profile"');
  });
});
