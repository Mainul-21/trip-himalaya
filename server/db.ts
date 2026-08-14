import { and, asc, desc, eq, inArray, isNotNull, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { randomUUID } from "crypto";
import {
  blogs,
  bookings,
  enquiries,
  InsertUser,
  newsletterSubscribers,
  reviews,
  tours,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) _db = drizzle(process.env.DATABASE_URL);
  return _db;
}

function requireDb<T>(db: T | null): T {
  if (!db) throw new Error("Database is unavailable");
  return db;
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

export async function listPublishedBlogs() {
  const db = requireDb(await getDb());
  return db.select().from(blogs).where(eq(blogs.isPublished, true)).orderBy(desc(blogs.publishedAt));
}

export async function listAdminBlogs() {
  const db = requireDb(await getDb());
  return db.select().from(blogs).orderBy(desc(blogs.createdAt));
}

export async function getBlogBySlug(slug: string) {
  const db = requireDb(await getDb());
  return (await db.select().from(blogs).where(and(eq(blogs.slug, slug), eq(blogs.isPublished, true))).limit(1))[0];
}

export async function createBlog(values: typeof blogs.$inferInsert) {
  const db = requireDb(await getDb());
  await db.insert(blogs).values(values);
}

export async function updateBlog(id: number, values: Partial<typeof blogs.$inferInsert>) {
  const db = requireDb(await getDb());
  await db.update(blogs).set(values).where(eq(blogs.id, id));
}

export async function deleteBlog(id: number) {
  const db = requireDb(await getDb());
  await db.delete(blogs).where(eq(blogs.id, id));
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
  const [tourResults, blogResults] = await Promise.all([
    db.select().from(tours).where(and(eq(tours.isPublished, true), or(like(tours.title, needle), like(tours.location, needle), like(tours.category, needle)))).orderBy(asc(tours.featureOrder)),
    db.select().from(blogs).where(and(eq(blogs.isPublished, true), or(like(blogs.title, needle), like(blogs.excerpt, needle)))).orderBy(desc(blogs.publishedAt)),
  ]);
  return { tours: tourResults, blogs: blogResults };
}

async function ensureInitialTours() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: tours.id }).from(tours).limit(1);
  if (existing.length > 0) return;

  const triund = "/manus-storage/triund-hikers_7653a06a.jpg";
  const valley = "/manus-storage/dharamshala-valley_971eee0a.jpg";
  const camp = "/manus-storage/triund-camp_ded436f5.jpg";
  const flags = "/manus-storage/dharamshala-prayer-flags_26329188.jpg";
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
