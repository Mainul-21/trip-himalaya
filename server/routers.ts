import { TRPCError } from "@trpc/server";
import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { adminProcedure, principalProcedure, publicProcedure, router } from "./_core/trpc";
import { assertCredentialAttemptAllowed, clearCredentialFailures, hashPassword, recordCredentialFailure, verifyPassword } from "./adminAuth";
import * as db from "./db";
import { isAdminRole } from "./roles";
import { COOKIE_NAME } from "../shared/const";
import { storagePut } from "./storage";
import { assertPublicFormSubmissionAllowed } from "./publicFormRateLimit";

const email = z.string().trim().email().max(320);
const password = z.string().min(12, "Use at least 12 characters.").max(128);
const textLine = z.string().trim().min(2).max(180);
const adminContent = z.string().trim().min(1);
const draftContent = z.string().trim();
const draftItinerary = z.array(z.object({ day: draftContent, title: draftContent, description: draftContent }));
const tourInput = z.object({
  title: adminContent,
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200),
  category: adminContent,
  location: adminContent,
  duration: adminContent,
  difficulty: adminContent,
  priceFrom: z.number().int().nonnegative(),
  heroImage: z.string().url().or(z.string().startsWith("/manus-storage/")),
  gallery: z.array(z.string().url().or(z.string().startsWith("/manus-storage/"))).min(1).max(10),
  shortDescription: draftContent,
  overview: draftContent,
  highlights: z.array(draftContent),
  itinerary: draftItinerary,
  inclusions: z.array(draftContent),
  exclusions: z.array(draftContent),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  isBestSeller: z.boolean().default(false),
  featureOrder: z.number().int().min(0).max(999),
}).superRefine((tour, ctx) => {
  if (!tour.isPublished) return;
  if (!tour.shortDescription.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["shortDescription"], message: "Add a short introduction before publishing." });
  if (!tour.overview.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["overview"], message: "Add a tour story before publishing." });
  if (!tour.highlights.some(Boolean)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["highlights"], message: "Add at least one highlight before publishing." });
  if (!tour.inclusions.some(Boolean)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["inclusions"], message: "Add at least one included item before publishing." });
  if (!tour.itinerary.some(day => day.day.trim() && day.title.trim() && day.description.trim())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["itinerary"], message: "Add one complete day plan before publishing." });
  }
});
const imageUploadInput = z.object({
  filename: z.string().trim().min(1).max(180),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  dataBase64: z.string().min(8).max(2_100_000),
});
const travelStyleInput = z.object({
  title: z.string().trim().min(2).max(80),
  href: z.string().trim().regex(/^(\/tours\?style=|\/contact)/),
  image: z.string().url().or(z.string().startsWith("/manus-storage/")),
  copy: z.string().trim().min(2).max(180),
});
const experienceInput = z.object({
  title: z.string().trim().min(2).max(220),
  copy: z.string().trim().min(2).max(500),
  href: z.string().trim().url().regex(/^https?:\/\//i, "Enter a full http:// or https:// hotel link.").max(2048),
  image: z.string().trim().url().or(z.string().startsWith("/manus-storage/")),
});
const homepageBadgeInput = z.object({ title: z.string().trim().min(2).max(80), copy: z.string().trim().min(2).max(160) });
const whyTripItemInput = z.object({ title: z.string().trim().min(2).max(100), copy: z.string().trim().min(2).max(240) });
const managedImageUrl = z.string().trim().url().or(z.string().startsWith("/manus-storage/"));
const agencyProfileInput = z.object({
  brandName: z.string().trim().min(2).max(160),
  tagline: z.string().trim().max(220),
  logoUrl: z.string().trim().url().or(z.string().startsWith("/manus-storage/")),
  phone: z.string().trim().min(7).max(40),
  whatsapp: z.string().trim().regex(/^\+?[0-9\s-]{7,40}$/, "Enter a WhatsApp number with digits only, optionally with +, spaces, or hyphens."),
  email,
  address: z.string().trim().min(2).max(2000),
  instagramUrl: z.string().trim().url().max(2048).or(z.literal("")),
  facebookUrl: z.string().trim().url().max(2048).or(z.literal("")),
  youtubeUrl: z.string().trim().url().max(2048).or(z.literal("")),
  googleMapsUrl: z.string().trim().url().max(2048).or(z.literal("")),
  exploreTitle: z.string().trim().min(2).max(220),
  exploreIntro: z.string().trim().min(2).max(1000),
  touristCount: z.string().trim().max(80),
  tourCount: z.string().trim().max(80),
  thirdMetricLabel: z.string().trim().max(80),
  thirdMetricValue: z.string().trim().max(80),
  experiencesTitle: z.string().trim().min(2).max(220),
  experiencesIntro: z.string().trim().min(2).max(1000),
  experiences: z.array(experienceInput).max(12),
  aboutStoryTitle: z.string().trim().min(2).max(220),
  aboutStoryBody: z.string().trim().min(2).max(4000),
  aboutStorySecondBody: z.string().trim().min(2).max(4000),
  heroTitle: z.string().trim().min(2).max(160),
  heroAccentTitle: z.string().trim().min(2).max(160),
  heroSubtitle: z.string().trim().min(2).max(280),
  heroImages: z.array(managedImageUrl).max(5),
  heroBadges: z.array(homepageBadgeInput).min(1).max(4),
  whyTripTitle: z.string().trim().min(2).max(160),
  whyTripItems: z.array(whyTripItemInput).min(1).max(5),
  travelStyles: z.array(travelStyleInput).min(1).max(8),
});

function matchesInitialSetupKey(expected: string, received: string | undefined) {
  if (!expected || !received) return false;
  const expectedBytes = Buffer.from(expected);
  const receivedBytes = Buffer.from(received);
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

function validImageSignature(buffer: Buffer, mimeType: "image/jpeg" | "image/png" | "image/webp") {
  if (mimeType === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return buffer.length > 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
}

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(({ ctx }) => (ctx.user && isAdminRole(ctx.user.role) && ctx.user.isActive ? ctx.user : null)),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  adminAuth: router({
    setupStatus: publicProcedure.query(async () => ({ needsSetup: !(await db.credentialAdminExists()) })),
    setupPrincipal: publicProcedure.input(z.object({ name: textLine.max(160), email, password, setupKey: z.string().min(1).max(128).optional() })).mutation(async ({ ctx, input }) => {
      if (await db.credentialAdminExists()) throw new TRPCError({ code: "FORBIDDEN", message: "The principal administrator is already configured." });
      assertCredentialAttemptAllowed(`setup:${input.email}`);
      const owner = await db.getUserByEmail(input.email);
      const passwordHash = await hashPassword(input.password);
      let principal;

      if (owner) {
        const hasAllowedExistingIdentity = !owner.passwordHash && owner.isActive && (
          !ENV.isProduction || matchesInitialSetupKey(ENV.initialAdminSetupKey, input.setupKey)
        );
        if (!hasAllowedExistingIdentity) {
          recordCredentialFailure(`setup:${input.email}`);
          throw new TRPCError({ code: "FORBIDDEN", message: "The principal setup identity could not be verified." });
        }
        principal = await db.enableExistingPrincipalCredential({ id: owner.id, name: input.name, email: input.email, passwordHash });
      } else {
        if (ENV.isProduction && !matchesInitialSetupKey(ENV.initialAdminSetupKey, input.setupKey)) {
          recordCredentialFailure(`setup:${input.email}`);
          throw new TRPCError({ code: "FORBIDDEN", message: "This hosted deployment needs its initial administrator setup key." });
        }
        await db.createCredentialAdmin({ name: input.name, email: input.email, passwordHash, role: "principal" });
        principal = await db.getUserByEmail(input.email);
      }
      if (!principal || !principal.passwordHash || principal.role !== "principal") {
        recordCredentialFailure(`setup:${input.email}`);
        throw new TRPCError({ code: "CONFLICT", message: "The principal account could not be created. Please try again." });
      }
      clearCredentialFailures(`setup:${input.email}`);
      const token = await sdk.createSessionToken(principal.openId, { name: principal.name || "Principal administrator" });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 24 * 14 });
      return { success: true, role: "principal" } as const;
    }),
    login: publicProcedure.input(z.object({ email, password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
      try {
        assertCredentialAttemptAllowed(`login:${input.email}`);
      } catch (error) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: error instanceof Error ? error.message : "Please try again later." });
      }
      const user = await db.getUserByEmail(input.email);
      if (!user || !isAdminRole(user.role) || !user.isActive || !(await verifyPassword(input.password, user.passwordHash))) {
        recordCredentialFailure(`login:${input.email}`);
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
      }
      clearCredentialFailures(`login:${input.email}`);
      const token = await sdk.createSessionToken(user.openId, { name: user.name || "Administrator" });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 24 * 14 });
      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
      return { success: true, role: user.role } as const;
    }),
  }),
  tours: router({
    list: publicProcedure.query(() => db.listPublishedTours()),
    featured: publicProcedure.query(async () => (await db.listPublishedTours()).filter(tour => tour.isFeatured)),
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(200) })).query(({ input }) => db.getTourBySlug(input.slug)),
    search: publicProcedure.input(z.object({ query: z.string().trim().min(2).max(100) })).query(({ input }) => db.searchPublicContent(input.query)),
    adminList: adminProcedure.query(() => db.listAdminTours()),
    create: adminProcedure.input(tourInput).mutation(async ({ input }) => {
      await db.createTour(input);
      return { success: true } as const;
    }),
    update: adminProcedure.input(tourInput.safeExtend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const { id, ...values } = input;
      await db.updateTour(id, values);
      return { success: true } as const;
    }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      await db.deleteTour(input.id);
      return { success: true } as const;
    }),
  }),
  agency: router({
    get: publicProcedure.query(() => db.getAgencyProfile()),
    update: adminProcedure.input(agencyProfileInput).mutation(async ({ input }) => {
      const normalizedWhatsapp = input.whatsapp.replace(/[^0-9]/g, "");
      return db.updateAgencyProfile({ ...input, whatsapp: normalizedWhatsapp });
    }),
  }),
  media: router({
    list: adminProcedure.query(() => db.listMediaAssets()),
    upload: adminProcedure.input(imageUploadInput).mutation(async ({ ctx, input }) => {
      const bytes = Buffer.from(input.dataBase64, "base64");
      if (!bytes.length || bytes.length > 1_500_000 || !validImageSignature(bytes, input.mimeType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Please upload a valid JPG, PNG, or WebP image up to 1.5 MB." });
      }
      const extension = input.mimeType === "image/jpeg" ? "jpg" : input.mimeType === "image/png" ? "png" : "webp";
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "tour-photo";
      const stored = await storagePut(`tour-media/${ctx.user.id}/${Date.now()}-${safeName}.${extension}`, bytes, input.mimeType);
      await db.createMediaAsset({ storageKey: stored.key, url: stored.url, filename: input.filename, mimeType: input.mimeType, sizeBytes: bytes.length, uploadedBy: ctx.user.id });
      return { success: true, asset: { url: stored.url, filename: input.filename } } as const;
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const result = await db.removeUnusedMediaAsset(input.id);
      if (!result.removed) throw new TRPCError({ code: result.reason === "missing" ? "NOT_FOUND" : "CONFLICT", message: result.reason === "in-use" ? "This photo is still used by a tour. Remove it from that tour before removing it from the library." : "This photo is no longer in the library." });
      return { success: true } as const;
    }),
  }),
  bookings: router({
    create: publicProcedure.input(z.object({
      tourId: z.number().int().positive().optional(),
      tourTitle: textLine,
      guestName: textLine.max(160), email, phone: z.string().trim().min(7).max(40),
      travelDate: z.string().trim().max(32).optional(), travellers: z.number().int().min(1).max(30),
      message: z.string().trim().max(3000).optional(),
    })).mutation(async ({ input }) => {
      try { assertPublicFormSubmissionAllowed("booking", input.email); } catch (error) { throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: error instanceof Error ? error.message : "Please try again later." }); }
      await db.createBooking({ ...input, travelDate: input.travelDate || null, message: input.message || null });
      return { success: true } as const;
    }),
    list: adminProcedure.query(() => db.listBookings()),
  }),
  enquiries: router({
    create: publicProcedure.input(z.object({ name: textLine.max(160), email, phone: z.string().trim().max(40).optional(), subject: z.string().trim().min(1).max(180), message: z.string().trim().min(1).max(4000) }))
      .mutation(async ({ input }) => { try { assertPublicFormSubmissionAllowed("enquiry", input.email); } catch (error) { throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: error instanceof Error ? error.message : "Please try again later." }); } await db.createEnquiry({ ...input, phone: input.phone || null }); return { success: true } as const; }),
    list: adminProcedure.query(() => db.listEnquiries()),
  }),
  newsletter: router({
    subscribe: publicProcedure.input(z.object({ email })).mutation(async ({ input }) => { await db.subscribeToNewsletter(input.email); return { success: true } as const; }),
    list: adminProcedure.query(() => db.listSubscribers()),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await db.deleteSubscriber(input.id); return { success: true } as const; }),
  }),
  reviews: router({
    list: publicProcedure.query(() => db.listPublishedReviews()),
    adminList: adminProcedure.query(() => db.listAdminReviews()),
    create: adminProcedure.input(z.object({ reviewerName: adminContent, location: adminContent.optional(), reviewerImage: z.string().trim().max(2048).optional(), rating: z.number().int().min(1).max(5), quote: adminContent, sourceLabel: adminContent.optional(), isPublished: z.boolean() }))
      .mutation(async ({ input }) => { await db.createReview({ ...input, location: input.location || null, reviewerImage: input.reviewerImage || null, sourceLabel: input.sourceLabel || null }); return { success: true } as const; }),
    update: adminProcedure.input(z.object({ id: z.number().int().positive(), reviewerName: adminContent, location: adminContent.optional(), reviewerImage: z.string().trim().max(2048).optional(), rating: z.number().int().min(1).max(5), quote: adminContent, sourceLabel: adminContent.optional(), isPublished: z.boolean() }))
      .mutation(async ({ input }) => { const { id, ...values } = input; await db.updateReview(id, { ...values, location: values.location || null, reviewerImage: values.reviewerImage || null, sourceLabel: values.sourceLabel || null }); return { success: true } as const; }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await db.deleteReview(input.id); return { success: true } as const; }),
  }),
  admin: router({
    overview: adminProcedure.query(async () => {
      const [bookings, enquiries, subscribers, tours] = await Promise.all([db.listBookings(), db.listEnquiries(), db.listSubscribers(), db.listAdminTours()]);
      return { bookings, enquiries, subscribers, tours };
    }),
    profile: adminProcedure.query(({ ctx }) => ctx.user),
    updateProfile: adminProcedure.input(z.object({ name: textLine.max(160).optional(), email: email.optional(), password: password.optional() })).mutation(async ({ ctx, input }) => {
      const values = { ...(input.name ? { name: input.name } : {}), ...(input.email ? { email: input.email } : {}), ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}) };
      await db.updateOwnAdminAccount(ctx.user.id, values);
      return { success: true } as const;
    }),
    admins: principalProcedure.query(() => db.listAdmins()),
    createAdmin: principalProcedure.input(z.object({ name: textLine.max(160), email, password })).mutation(async ({ input }) => {
      if (await db.getUserByEmail(input.email)) throw new TRPCError({ code: "CONFLICT", message: "An account already uses that email address." });
      await db.createCredentialAdmin({ name: input.name, email: input.email, passwordHash: await hashPassword(input.password), role: "admin" });
      return { success: true } as const;
    }),
    updateAdmin: principalProcedure.input(z.object({ id: z.number().int().positive(), name: textLine.max(160).optional(), email: email.optional(), password: password.optional(), isActive: z.boolean().optional() }))
      .mutation(async ({ ctx, input }) => {
        const target = (await db.listAdmins()).find(admin => admin.id === input.id);
        if (!target || target.role === "principal") throw new TRPCError({ code: "FORBIDDEN", message: "The principal administrator cannot be changed from this screen." });
        if (target.id === ctx.user.id && input.isActive === false) throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot disable your own account." });
        await db.updateAdminAccount(input.id, { ...(input.name ? { name: input.name } : {}), ...(input.email ? { email: input.email } : {}), ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}), ...(input.isActive !== undefined ? { isActive: input.isActive } : {}) });
        return { success: true } as const;
      }),
    deleteAdmin: principalProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const target = (await db.listAdmins()).find(admin => admin.id === input.id);
      if (!target || target.role !== "admin" || target.id === ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only a subordinate administrator can be removed." });
      }
      await db.deleteAdminAccount(target.id);
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
