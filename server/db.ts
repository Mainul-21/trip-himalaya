import { and, asc, desc, eq, inArray, isNotNull, isNull, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type PoolOptions } from "mysql2";
import { readFileSync } from "node:fs";
import { randomUUID } from "crypto";
import {
  agencyProfiles,
  bookings,
  enquiries,
  InsertUser,
  mediaAssets,
  newsletterSubscribers,
  reviews,
  tours,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

export const DEFAULT_TRAVEL_STYLES = [
  { title: "Trekking", href: "/tours?style=trekking", image: "/manus-storage/cat-trekking_0c532a80.jpg", copy: "Guided walks with a pace that makes sense." },
  { title: "Culture & local", href: "/tours?style=experiences", image: "/manus-storage/cat-spiritual_e35128a7.jpg", copy: "Dharamshala, food and local context." },
  { title: "Adventure", href: "/tours?style=adventure", image: "/manus-storage/cat-camping_f8918883.jpg", copy: "Active Himachal escapes with practical planning." },
  { title: "Short breaks", href: "/tours?style=short-breaks", image: "/manus-storage/cat-village_2bd304a0.jpg", copy: "One- and two-day plans for a quick reset." },
  { title: "Best sellers", href: "/tours?style=best-sellers", image: "/manus-storage/cat-tours_d33aa080.jpg", copy: "Journeys the Trip Himalaya team has marked." },
  { title: "Custom plan", href: "/contact", image: "/manus-storage/cat-custom_207315af.jpg", copy: "Share your dates and build your own route." },
] as const;

export type TravelStyle = { title: string; href: string; image: string; copy: string };
export type ExperienceItem = { title: string; copy: string; href: string; image: string };
export type HomepageBadge = { title: string; copy: string };
export type WhyTripItem = { title: string; copy: string };

function createDefaultExperiences(): ExperienceItem[] {
  return [];
}

export const DEFAULT_EXPERIENCES: ExperienceItem[] = createDefaultExperiences();

export const DEFAULT_AGENCY_PROFILE = {
  brandName: "Trip Himalaya",
  tagline: "Explore. Experience. Live.",
  logoUrl: "/manus-storage/logo_triphimalaya_598a0ec2.jpg",
  phone: "+918219628359",
  whatsapp: "918219628359",
  email: "hello@triphimalaya.in",
  address: "Dharamshala, Himachal Pradesh, India",
  instagramUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  googleMapsUrl: "",
  exploreTitle: "Choose your travel style.",
  exploreIntro: "Start with the kind of mountain time you want. Every choice opens a filtered journey list.",
  touristCount: "",
  tourCount: "",
  thirdMetricLabel: "",
  thirdMetricValue: "",
  travelStyles: DEFAULT_TRAVEL_STYLES.map(style => ({ ...style })),
  experiencesTitle: "Stay close to the mountains.",
  experiencesIntro: "Explore hotels and stays selected by Trip Himalaya. Open a stay to view its booking or website link.",
  experiences: createDefaultExperiences(),
  aboutStoryTitle: "A mountain journey that started in Dharamshala.",
  aboutStoryBody: "Trip Himalaya was founded in 2020 by Ravi Kant with a simple belief: travelling in the Himalayas should feel personal, clear, and connected to the place.",
  aboutStorySecondBody: "We create journeys across Himachal for people who want more than a hurried list of stops. Our work brings together trekking, spiritual journeys, camping, village experiences, Himachal tours, and custom plans.",
  heroTitle: "DISCOVER HIMACHAL.",
  heroAccentTitle: "EXPERIENCE THE HIMALAYAS.",
  heroSubtitle: "Curated journeys. Local expertise. Unforgettable memories.",
  heroImages: [] as string[],
  heroBadges: [
    { title: "Local Experts", copy: "Born in the Himalayas" },
    { title: "Best Price Guarantee", copy: "No hidden charges" },
    { title: "Safe & Comfortable", copy: "Your safety, our priority" },
    { title: "24x7 Support", copy: "We are always with you" },
  ] as HomepageBadge[],
  whyTripTitle: "WHY TRIP HIMALAYA?",
  whyTripItems: [
    { title: "LOCAL EXPERTS", copy: "We are locals, we know the Himalayas best." },
    { title: "SAFE & RELIABLE", copy: "Your safety and comfort is our top priority." },
    { title: "BEST PRICE GUARANTEE", copy: "Transparent pricing with no hidden charges." },
    { title: "PERSONALISED SUPPORT", copy: "From planning to journey, we are with you." },
    { title: "RESPONSIBLE TOURISM", copy: "We respect nature & support local communities." },
  ] as WhyTripItem[],
};

export type AgencyProfileValues = Omit<typeof DEFAULT_AGENCY_PROFILE, "travelStyles" | "heroImages" | "heroBadges" | "whyTripItems"> & { travelStyles: TravelStyle[]; heroImages: string[]; heroBadges: HomepageBadge[]; whyTripItems: WhyTripItem[] };
export type AgencyProfileReadValues = AgencyProfileValues & { schemaNeedsUpdate: boolean; databaseNeedsAttention: boolean };

function agencyProfileFallback(schemaNeedsUpdate = false, databaseNeedsAttention = false): AgencyProfileReadValues {
  return {
    ...DEFAULT_AGENCY_PROFILE,
    travelStyles: DEFAULT_AGENCY_PROFILE.travelStyles.map(style => ({ ...style })),
    heroImages: [...DEFAULT_AGENCY_PROFILE.heroImages],
    heroBadges: DEFAULT_AGENCY_PROFILE.heroBadges.map(item => ({ ...item })),
    whyTripItems: DEFAULT_AGENCY_PROFILE.whyTripItems.map(item => ({ ...item })),
    schemaNeedsUpdate,
    databaseNeedsAttention,
  };
}

function isMissingAgencyBrandingColumn(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /(exploreTitle|exploreIntro|travelStylesJson|touristCount|tourCount|thirdMetricLabel|thirdMetricValue|experiencesTitle|experiencesIntro|experiencesJson|aboutStoryTitle|aboutStoryBody|aboutStorySecondBody|heroTitle|heroAccentTitle|heroSubtitle|heroImagesJson|heroBadgesJson|whyTripTitle|whyTripItemsJson)/i.test(message) && /(unknown column|no such column|failed query)/i.test(message);
}

let _db: ReturnType<typeof drizzle> | null = null;

function shouldUseTls(databaseUrl: string) {
  const explicit = process.env.DATABASE_SSL?.trim().toLowerCase();
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  if (process.env.TIDB_ENABLE_SSL?.trim().toLowerCase() === "true") return true;
  try {
    return new URL(databaseUrl).port === "4000";
  } catch {
    return false;
  }
}

function getDatabaseOptions(databaseUrl: string): PoolOptions {
  const options: PoolOptions = {
    uri: databaseUrl,
    enableKeepAlive: true,
    waitForConnections: true,
    connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT || 5),
  };
  if (shouldUseTls(databaseUrl)) {
    const caPath = process.env.DATABASE_SSL_CA_PATH?.trim();
    options.ssl = {
      minVersion: "TLSv1.2",
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase() !== "false",
      ...(caPath ? { ca: readFileSync(caPath) } : {}),
    };
  }
  return options;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(createPool(getDatabaseOptions(process.env.DATABASE_URL)));
  }
  return _db;
}

function requireDb<T>(db: T | null): T {
  if (!db) throw new Error("Database is unavailable");
  return db;
}

export async function createMediaAsset(input: { storageKey: string; url: string; filename: string; mimeType: string; sizeBytes: number; uploadedBy: number }) {
  const db = requireDb(await getDb());
  await db.insert(mediaAssets).values(input);
}

export async function listMediaAssets() {
  const db = requireDb(await getDb());
  return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
}

export async function removeUnusedMediaAsset(id: number) {
  const db = requireDb(await getDb());
  const asset = (await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1))[0];
  if (!asset) return { removed: false, reason: "missing" as const };
  const assignedTours = await db.select({ heroImage: tours.heroImage, gallery: tours.gallery }).from(tours);
  const inUse = assignedTours.some(tour => tour.heroImage === asset.url || (Array.isArray(tour.gallery) && tour.gallery.includes(asset.url)));
  if (inUse) return { removed: false, reason: "in-use" as const };
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  return { removed: true as const };
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db || !user.openId) return;
  const values: Record<string, unknown> = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  if (user.name !== undefined) { values.name = user.name; updateSet.name = user.name; }
  if (user.email !== undefined) { values.email = user.email; updateSet.email = user.email; }
  if (user.passwordHash !== undefined) { values.passwordHash = user.passwordHash; updateSet.passwordHash = user.passwordHash; }
  if (user.loginMethod !== undefined) { values.loginMethod = user.loginMethod; updateSet.loginMethod = user.loginMethod; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  if (user.isActive !== undefined) { values.isActive = user.isActive; updateSet.isActive = user.isActive; }
  if (!user.role && user.openId === ENV.ownerOpenId) {
    values.role = "principal";
    updateSet.role = "principal";
  }
  await db.insert(users).values(values as InsertUser).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1))[0];
}

export async function credentialAdminExists() {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select({ id: users.id }).from(users).where(and(inArray(users.role, ["principal", "admin"]), isNotNull(users.passwordHash))).limit(1);
  return result.length > 0;
}

export async function createCredentialAdmin(input: { name: string; email: string; passwordHash: string; role: "principal" | "admin" }) {
  const db = requireDb(await getDb());
  await db.insert(users).values({
    openId: `credential-${randomUUID()}`,
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    loginMethod: "email-password",
    role: input.role,
    isActive: true,
    lastSignedIn: new Date(),
  });
}

/**
 * The project owner already has a principal row from the platform identity
 * bootstrap. First-time credential setup must upgrade that row rather than
 * insert a duplicate email record.
 */
export async function enableExistingPrincipalCredential(input: { id: number; name: string; email: string; passwordHash: string }) {
  const db = requireDb(await getDb());
  await db.update(users).set({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    loginMethod: "email-password",
    role: "principal",
    isActive: true,
    lastSignedIn: new Date(),
  }).where(and(eq(users.id, input.id), isNull(users.passwordHash)));
  return getUserByEmail(input.email);
}

export async function listAdmins() {
  const db = requireDb(await getDb());
  return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn })
    .from(users)
    .where(and(inArray(users.role, ["principal", "admin"]), isNotNull(users.passwordHash)))
    .orderBy(asc(users.createdAt));
}

export async function updateAdminAccount(id: number, values: { name?: string; email?: string; passwordHash?: string; isActive?: boolean }) {
  const db = requireDb(await getDb());
  const next = { ...values, ...(values.email ? { email: values.email.toLowerCase() } : {}) };
  await db.update(users).set(next).where(eq(users.id, id));
}

export async function deleteAdminAccount(id: number) {
  const db = requireDb(await getDb());
  await db.delete(users).where(eq(users.id, id));
}

export async function updateOwnAdminAccount(id: number, values: { name?: string; email?: string; passwordHash?: string }) {
  await updateAdminAccount(id, values);
}

export async function getAgencyProfile(): Promise<AgencyProfileReadValues> {
  const db = await getDb();
  if (!db) return agencyProfileFallback(false, true);
  let profile: typeof agencyProfiles.$inferSelect | undefined;
  try {
    profile = (await db.select().from(agencyProfiles).limit(1))[0];
  } catch (error) {
    if (!isMissingAgencyBrandingColumn(error)) {
      console.warn("[Agency] Profile read unavailable; using safe fallback.", error instanceof Error ? error.message : String(error));
      return agencyProfileFallback(false, true);
    }
    const legacyProfile = (await db.select({
      brandName: agencyProfiles.brandName,
      tagline: agencyProfiles.tagline,
      logoUrl: agencyProfiles.logoUrl,
      phone: agencyProfiles.phone,
      whatsapp: agencyProfiles.whatsapp,
      email: agencyProfiles.email,
      address: agencyProfiles.address,
      instagramUrl: agencyProfiles.instagramUrl,
      facebookUrl: agencyProfiles.facebookUrl,
      youtubeUrl: agencyProfiles.youtubeUrl,
      googleMapsUrl: agencyProfiles.googleMapsUrl,
    }).from(agencyProfiles).limit(1))[0];
    if (!legacyProfile) return agencyProfileFallback(true);
    return {
      ...legacyProfile,
      exploreTitle: DEFAULT_AGENCY_PROFILE.exploreTitle,
      exploreIntro: DEFAULT_AGENCY_PROFILE.exploreIntro,
      touristCount: DEFAULT_AGENCY_PROFILE.touristCount,
      tourCount: DEFAULT_AGENCY_PROFILE.tourCount,
      thirdMetricLabel: DEFAULT_AGENCY_PROFILE.thirdMetricLabel,
      thirdMetricValue: DEFAULT_AGENCY_PROFILE.thirdMetricValue,
      experiencesTitle: DEFAULT_AGENCY_PROFILE.experiencesTitle,
      experiencesIntro: DEFAULT_AGENCY_PROFILE.experiencesIntro,
      experiences: createDefaultExperiences(),
      aboutStoryTitle: DEFAULT_AGENCY_PROFILE.aboutStoryTitle,
      aboutStoryBody: DEFAULT_AGENCY_PROFILE.aboutStoryBody,
      aboutStorySecondBody: DEFAULT_AGENCY_PROFILE.aboutStorySecondBody,
      heroTitle: DEFAULT_AGENCY_PROFILE.heroTitle,
      heroAccentTitle: DEFAULT_AGENCY_PROFILE.heroAccentTitle,
      heroSubtitle: DEFAULT_AGENCY_PROFILE.heroSubtitle,
      heroImages: [...DEFAULT_AGENCY_PROFILE.heroImages],
      heroBadges: DEFAULT_AGENCY_PROFILE.heroBadges.map(item => ({ ...item })),
      whyTripTitle: DEFAULT_AGENCY_PROFILE.whyTripTitle,
      whyTripItems: DEFAULT_AGENCY_PROFILE.whyTripItems.map(item => ({ ...item })),
      travelStyles: DEFAULT_AGENCY_PROFILE.travelStyles.map(style => ({ ...style })),
      schemaNeedsUpdate: true,
      databaseNeedsAttention: false,
    };
  }
  if (!profile) return agencyProfileFallback();
  let travelStyles = DEFAULT_AGENCY_PROFILE.travelStyles;
  try {
    const parsed = profile.travelStylesJson ? JSON.parse(profile.travelStylesJson) : [];
    if (Array.isArray(parsed) && parsed.length) travelStyles = parsed;
  } catch { /* Keep the safe built-in styles if old or malformed content exists. */ }
  return {
    brandName: profile.brandName,
    tagline: profile.tagline,
    logoUrl: profile.logoUrl,
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    email: profile.email,
    address: profile.address,
    instagramUrl: profile.instagramUrl,
    facebookUrl: profile.facebookUrl,
    youtubeUrl: profile.youtubeUrl,
    googleMapsUrl: profile.googleMapsUrl,
    touristCount: profile.touristCount || "",
    tourCount: profile.tourCount || "",
    thirdMetricLabel: profile.thirdMetricLabel || "",
    thirdMetricValue: profile.thirdMetricValue || "",
    exploreTitle: profile.exploreTitle || DEFAULT_AGENCY_PROFILE.exploreTitle,
    exploreIntro: profile.exploreIntro || DEFAULT_AGENCY_PROFILE.exploreIntro,
    experiencesTitle: profile.experiencesTitle || DEFAULT_AGENCY_PROFILE.experiencesTitle,
    experiencesIntro: profile.experiencesIntro || DEFAULT_AGENCY_PROFILE.experiencesIntro,
    experiences: (() => {
      try {
        const parsed = profile.experiencesJson ? JSON.parse(profile.experiencesJson) : [];
        return Array.isArray(parsed) ? parsed.map((item): ExperienceItem => ({
          title: typeof item?.title === "string" ? item.title : "",
          copy: typeof item?.copy === "string" ? item.copy : "",
          href: typeof item?.href === "string" ? item.href : "",
          image: typeof item?.image === "string" ? item.image : "",
        })) : createDefaultExperiences();
      } catch { return createDefaultExperiences(); }
    })(),
    aboutStoryTitle: profile.aboutStoryTitle || DEFAULT_AGENCY_PROFILE.aboutStoryTitle,
    aboutStoryBody: profile.aboutStoryBody || DEFAULT_AGENCY_PROFILE.aboutStoryBody,
    aboutStorySecondBody: profile.aboutStorySecondBody || DEFAULT_AGENCY_PROFILE.aboutStorySecondBody,
    heroTitle: profile.heroTitle || DEFAULT_AGENCY_PROFILE.heroTitle,
    heroAccentTitle: profile.heroAccentTitle || DEFAULT_AGENCY_PROFILE.heroAccentTitle,
    heroSubtitle: profile.heroSubtitle || DEFAULT_AGENCY_PROFILE.heroSubtitle,
    heroImages: (() => {
      try { const parsed = profile.heroImagesJson ? JSON.parse(profile.heroImagesJson) : []; return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 5) : []; } catch { return []; }
    })(),
    heroBadges: (() => {
      try { const parsed = profile.heroBadgesJson ? JSON.parse(profile.heroBadgesJson) : []; return Array.isArray(parsed) && parsed.length ? parsed.slice(0, 4).map((item): HomepageBadge => ({ title: typeof item?.title === "string" ? item.title : "", copy: typeof item?.copy === "string" ? item.copy : "" })).filter(item => item.title && item.copy) : DEFAULT_AGENCY_PROFILE.heroBadges.map(item => ({ ...item })); } catch { return DEFAULT_AGENCY_PROFILE.heroBadges.map(item => ({ ...item })); }
    })(),
    whyTripTitle: profile.whyTripTitle || DEFAULT_AGENCY_PROFILE.whyTripTitle,
    whyTripItems: (() => {
      try { const parsed = profile.whyTripItemsJson ? JSON.parse(profile.whyTripItemsJson) : []; return Array.isArray(parsed) && parsed.length ? parsed.slice(0, 5).map((item): WhyTripItem => ({ title: typeof item?.title === "string" ? item.title : "", copy: typeof item?.copy === "string" ? item.copy : "" })).filter(item => item.title && item.copy) : DEFAULT_AGENCY_PROFILE.whyTripItems.map(item => ({ ...item })); } catch { return DEFAULT_AGENCY_PROFILE.whyTripItems.map(item => ({ ...item })); }
    })(),
    travelStyles,
    schemaNeedsUpdate: false,
    databaseNeedsAttention: false,
  };
}

export async function updateAgencyProfile(values: AgencyProfileValues): Promise<AgencyProfileValues> {
  const db = requireDb(await getDb());
  const { travelStyles, experiences, heroImages, heroBadges, whyTripItems, ...profileValues } = values;
  const persistedValues = { ...profileValues, travelStylesJson: JSON.stringify(travelStyles), experiencesJson: JSON.stringify(experiences), heroImagesJson: JSON.stringify(heroImages), heroBadgesJson: JSON.stringify(heroBadges), whyTripItemsJson: JSON.stringify(whyTripItems) };
  const existing = (await db.select({ id: agencyProfiles.id }).from(agencyProfiles).limit(1))[0];
  if (existing) await db.update(agencyProfiles).set(persistedValues).where(eq(agencyProfiles.id, existing.id));
  else await db.insert(agencyProfiles).values(persistedValues);
  return getAgencyProfile();
}

export async function listPublishedTours() {
  const db = requireDb(await getDb());
  await ensureInitialTours();
  return db.select().from(tours).where(eq(tours.isPublished, true)).orderBy(asc(tours.featureOrder), desc(tours.createdAt));
}

export async function listAdminTours() {
  const db = requireDb(await getDb());
  await ensureInitialTours();
  return db.select().from(tours).orderBy(asc(tours.featureOrder), desc(tours.createdAt));
}

export async function getTourBySlug(slug: string) {
  const db = requireDb(await getDb());
  return (await db.select().from(tours).where(and(eq(tours.slug, slug), eq(tours.isPublished, true))).limit(1))[0];
}

export async function getTourById(id: number) {
  const db = requireDb(await getDb());
  return (await db.select().from(tours).where(eq(tours.id, id)).limit(1))[0];
}

export async function createTour(values: typeof tours.$inferInsert) {
  const db = requireDb(await getDb());
  await db.insert(tours).values(values);
}

export async function updateTour(id: number, values: Partial<typeof tours.$inferInsert>) {
  const db = requireDb(await getDb());
  await db.update(tours).set(values).where(eq(tours.id, id));
}

export async function deleteTour(id: number) {
  const db = requireDb(await getDb());
  await db.delete(tours).where(eq(tours.id, id));
}

export async function createBooking(values: typeof bookings.$inferInsert) {
  const db = requireDb(await getDb());
  await db.insert(bookings).values(values);
}

export async function createEnquiry(values: typeof enquiries.$inferInsert) {
  const db = requireDb(await getDb());
  await db.insert(enquiries).values(values);
}

export async function subscribeToNewsletter(email: string) {
  const db = requireDb(await getDb());
  await db.insert(newsletterSubscribers).values({ email: email.toLowerCase(), isActive: true }).onDuplicateKeyUpdate({ set: { isActive: true } });
}

export async function listBookings() {
  const db = requireDb(await getDb());
  return db.select().from(bookings).orderBy(desc(bookings.createdAt));
}

export async function listEnquiries() {
  const db = requireDb(await getDb());
  return db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
}

export async function listSubscribers() {
  const db = requireDb(await getDb());
  return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt));
}

export async function deleteSubscriber(id: number) {
  const db = requireDb(await getDb());
  await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
}

export async function listPublishedReviews() {
  const db = requireDb(await getDb());
  return db.select().from(reviews).where(eq(reviews.isPublished, true)).orderBy(desc(reviews.createdAt));
}

export async function listAdminReviews() {
  const db = requireDb(await getDb());
  return db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function createReview(values: typeof reviews.$inferInsert) {
  const db = requireDb(await getDb());
  await db.insert(reviews).values(values);
}

export async function updateReview(id: number, values: Partial<typeof reviews.$inferInsert>) {
  const db = requireDb(await getDb());
  await db.update(reviews).set(values).where(eq(reviews.id, id));
}

export async function deleteReview(id: number) {
  const db = requireDb(await getDb());
  await db.delete(reviews).where(eq(reviews.id, id));
}

export async function searchPublicContent(query: string) {
  const db = requireDb(await getDb());
  const needle = `%${query}%`;
  const toursResult = await db.select().from(tours).where(and(eq(tours.isPublished, true), or(like(tours.title, needle), like(tours.location, needle), like(tours.category, needle)))).orderBy(asc(tours.featureOrder));
  return { tours: toursResult };
}

async function ensureInitialTours() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: tours.id }).from(tours).limit(1);
  if (existing.length > 0) return;

  const triund = "/manus-storage/triund-trek-unsplash_2dd49872.jpg";
  const valley = "/manus-storage/dhauladhar-dharamshala_8ddd37f7.jpg";
  const camp = "/manus-storage/triund-lake-unsplash_d755f9cf.jpg";
  const flags = "/manus-storage/dhauladhar-hut-panorama_c5effca1.jpg";
  await db.insert(tours).values([
    {
      title: "Triund Sunrise Trek", slug: "triund-sunrise-trek", category: "Trekking", location: "McLeod Ganj, Dharamshala", duration: "2 Days / 1 Night", difficulty: "Easy–Moderate", priceFrom: 2400,
      heroImage: triund, gallery: [triund, camp], shortDescription: "A guided ridge walk above the Kangra Valley, paced for first-time Himalayan trekkers.",
      overview: "Triund is a classic Dharamshala trek for travellers who want open Dhauladhar views without a long expedition. Our local guide keeps the pace steady, handles camp coordination, and leaves space for the sunrise.",
      highlights: ["Guided trail from McLeod Ganj", "Dhauladhar ridge sunset and sunrise", "Small-group mountain camp", "Local trail briefing and support"],
      itinerary: [{ day: "Day 1", title: "McLeod Ganj to Triund", description: "Meet your guide, begin the forest-and-ridge trail, and settle into camp before the evening views." }, { day: "Day 2", title: "Sunrise at Triund and return", description: "Watch first light over the Dhauladhar range, have breakfast, and descend with your guide." }],
      inclusions: ["Local mountain guide", "Camping equipment", "Dinner and breakfast", "Trail permits where applicable"], exclusions: ["Travel to McLeod Ganj", "Personal trekking gear", "Meals not listed"],
      isPublished: true, isFeatured: true, featureOrder: 1,
    },
    {
      title: "Kareri Lake Explorer", slug: "kareri-lake-explorer", category: "Trekking", location: "Kareri Village, Kangra", duration: "3 Days / 2 Nights", difficulty: "Moderate", priceFrom: 5600,
      heroImage: valley, gallery: [valley, triund], shortDescription: "A slower three-day journey through Gaddi villages, cedar paths, and a high-altitude lake.",
      overview: "Kareri Lake combines a rewarding mountain trail with time in the village landscape of Kangra. It suits active travellers who prefer a measured pace and a guide who knows the trail conditions.",
      highlights: ["Kareri village stay", "Riverside and cedar forest trail", "High-altitude lake views", "Local Gaddi mountain context"],
      itinerary: [{ day: "Day 1", title: "Dharamshala to Kareri Village", description: "Drive to the village, meet the local support team, and prepare for the trail." }, { day: "Day 2", title: "Kareri Village to Lake Camp", description: "Trek alongside the stream to camp near Kareri Lake." }, { day: "Day 3", title: "Lake to village and Dharamshala", description: "Return by the valley trail after breakfast." }],
      inclusions: ["Local guide", "Tent stay", "All listed meals", "Safety briefing"], exclusions: ["Personal insurance", "Personal snacks", "Transport beyond stated route"],
      isPublished: true, isFeatured: true, featureOrder: 2,
    },
    {
      title: "Dharamshala Culture & Monasteries", slug: "dharamshala-culture-monasteries", category: "Experiences", location: "Dharamshala & McLeod Ganj", duration: "1 Day", difficulty: "Easy", priceFrom: 1800,
      heroImage: flags, gallery: [flags, valley], shortDescription: "A grounded day in the living culture of upper Dharamshala, led at an unhurried local pace.",
      overview: "Explore the cultural heart of Dharamshala with a locally coordinated day that balances monastery time, views, food stops, and mindful travel etiquette.",
      highlights: ["McLeod Ganj orientation", "Monastery and local market time", "Kangra Valley viewpoints", "Flexible private timing"],
      itinerary: [{ day: "Day 1", title: "Upper Dharamshala immersion", description: "Meet your host and explore cultural landmarks, local lanes, and scenic pauses around McLeod Ganj." }],
      inclusions: ["Local host", "Private planning support", "Drinking water"], exclusions: ["Entry fees", "Meals", "Personal shopping"],
      isPublished: true, isFeatured: true, featureOrder: 3,
    },
    {
      title: "Bir Billing Paragliding Escape", slug: "bir-billing-paragliding-escape", category: "Adventure", location: "Bir Billing, Himachal Pradesh", duration: "2 Days / 1 Night", difficulty: "Easy", priceFrom: 6900,
      heroImage: camp, gallery: [camp, valley], shortDescription: "A flexible weekend plan from Dharamshala for travellers seeking mountain air and a Bir Billing flight window.",
      overview: "This short adventure pairs the mountain town of Bir with a professionally coordinated paragliding window and time to slow down in the valley.",
      highlights: ["Bir Billing activity coordination", "Mountain stay planning", "Dharamshala transfer support", "Weather-aware itinerary"],
      itinerary: [{ day: "Day 1", title: "Dharamshala to Bir", description: "Travel to Bir, settle in, and review the next day’s weather and activity plan." }, { day: "Day 2", title: "Flight window and return", description: "Meet the certified activity operator for your scheduled window, then return at a comfortable pace." }],
      inclusions: ["Planning coordinator", "Shared local transport", "One night stay", "Activity transfer"], exclusions: ["Paragliding activity fee", "Meals not listed", "Personal insurance"],
      isPublished: true, isFeatured: true, featureOrder: 4,
    },
  ]);
}
