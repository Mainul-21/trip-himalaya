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
  title: varchar("title", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  category: varchar("category", { length: 80 }).notNull(),
  location: varchar("location", { length: 180 }).notNull(),
  duration: varchar("duration", { length: 60 }).notNull(),
  difficulty: varchar("difficulty", { length: 40 }).notNull(),
  priceFrom: int("priceFrom").notNull(),
  heroImage: text("heroImage").notNull(),
  gallery: json("gallery").$type<string[]>().notNull(),
  shortDescription: varchar("shortDescription", { length: 360 }).notNull(),
  overview: text("overview").notNull(),
  highlights: json("highlights").$type<string[]>().notNull(),
  itinerary: json("itinerary").$type<{ day: string; title: string; description: string }[]>().notNull(),
  inclusions: json("inclusions").$type<string[]>().notNull(),
  exclusions: json("exclusions").$type<string[]>().notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
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

export const blogs = mysqlTable("blogs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  excerpt: varchar("excerpt", { length: 360 }).notNull(),
  content: text("content").notNull(),
  coverImage: text("coverImage").notNull(),
  author: varchar("author", { length: 160 }).notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  reviewerName: varchar("reviewerName", { length: 160 }).notNull(),
  location: varchar("location", { length: 180 }),
  quote: text("quote").notNull(),
  sourceLabel: varchar("sourceLabel", { length: 100 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
