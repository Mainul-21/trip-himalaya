import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 160 }),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["principal", "admin", "visitor", "user"]).default("visitor").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const tours = mysqlTable("tours", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  duration: text("duration").notNull(),
  difficulty: text("difficulty").notNull(),
  priceFrom: int("priceFrom").notNull(),
  heroImage: text("heroImage").notNull(),
  gallery: json("gallery").$type<string[]>().notNull(),
  shortDescription: text("shortDescription").notNull(),
  overview: text("overview").notNull(),
  highlights: json("highlights").$type<string[]>().notNull(),
  itinerary: json("itinerary").$type<{ day: string; title: string; description: string }[]>().notNull(),
  inclusions: json("inclusions").$type<string[]>().notNull(),
  exclusions: json("exclusions").$type<string[]>().notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isBestSeller: boolean("isBestSeller").default(false).notNull(),
  featureOrder: int("featureOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tourId"),
  tourTitle: varchar("tourTitle", { length: 180 }).notNull(),
  guestName: varchar("guestName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  travelDate: varchar("travelDate", { length: 32 }),
  travellers: int("travellers").notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["new", "contacted", "confirmed", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const enquiries = mysqlTable("enquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  subject: varchar("subject", { length: 180 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "replied", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  reviewerName: text("reviewerName").notNull(),
  location: text("location"),
  reviewerImage: text("reviewerImage"),
  rating: int("rating").default(5).notNull(),
  quote: text("quote").notNull(),
  sourceLabel: text("sourceLabel"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const mediaAssets = mysqlTable("mediaAssets", {
  id: int("id").autoincrement().primaryKey(),
  storageKey: varchar("storageKey", { length: 520 }).notNull().unique(),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 180 }).notNull(),
  mimeType: varchar("mimeType", { length: 80 }).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agencyProfiles = mysqlTable("agencyProfiles", {
  id: int("id").autoincrement().primaryKey(),
  brandName: varchar("brandName", { length: 160 }).notNull(),
  tagline: varchar("tagline", { length: 220 }).notNull(),
  logoUrl: text("logoUrl").notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 40 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  address: text("address").notNull(),
  instagramUrl: varchar("instagramUrl", { length: 2048 }).notNull(),
  facebookUrl: varchar("facebookUrl", { length: 2048 }).notNull(),
  youtubeUrl: varchar("youtubeUrl", { length: 2048 }).notNull(),
  googleMapsUrl: varchar("googleMapsUrl", { length: 2048 }).notNull(),
  exploreTitle: varchar("exploreTitle", { length: 220 }).notNull().default("Choose your travel style."),
  exploreIntro: text("exploreIntro"),
  travelStylesJson: text("travelStylesJson"),
  touristCount: varchar("touristCount", { length: 80 }),
  tourCount: varchar("tourCount", { length: 80 }),
  thirdMetricLabel: varchar("thirdMetricLabel", { length: 80 }),
  thirdMetricValue: varchar("thirdMetricValue", { length: 80 }),
  experiencesTitle: varchar("experiencesTitle", { length: 220 }),
  experiencesIntro: text("experiencesIntro"),
  experiencesJson: text("experiencesJson"),
  aboutStoryTitle: varchar("aboutStoryTitle", { length: 220 }),
  aboutStoryBody: text("aboutStoryBody"),
  aboutStorySecondBody: text("aboutStorySecondBody"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
