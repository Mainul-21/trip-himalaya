import { beforeEach, describe, expect, it, vi } from "vitest";
import * as db from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { resetPublicFormRateLimitForTests } from "./publicFormRateLimit";

vi.mock("./db", () => ({
  createBooking: vi.fn(),
  createEnquiry: vi.fn(),
  createMediaAsset: vi.fn(),
  createReview: vi.fn(),
  listMediaAssets: vi.fn(),
  removeUnusedMediaAsset: vi.fn(),
  createTour: vi.fn(),
  createBlog: vi.fn(),
  credentialAdminExists: vi.fn(),
  getUserByEmail: vi.fn(),
  createCredentialAdmin: vi.fn(),
  enableExistingPrincipalCredential: vi.fn(),
}));
vi.mock("./storage", () => ({ storagePut: vi.fn().mockResolvedValue({ key: "tour-media/2/demo_abc123.png", url: "/manus-storage/tour-media/2/demo_abc123.png" }) }));
vi.mock("./_core/sdk", () => ({ sdk: { createSessionToken: vi.fn().mockResolvedValue("secure-principal-session") } }));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: AuthenticatedUser["role"]): TrpcContext {
  const user: AuthenticatedUser = {
    id: role === "principal" ? 1 : 2,
    openId: `credential-${role}`,
    name: `${role} account`,
    email: `${role}@example.com`,
    passwordHash: "not-used-in-these-tests",
    loginMethod: "email-password",
    role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined, cookie: () => undefined } as TrpcContext["res"],
  };
}

describe("visitor submissions", () => {
  beforeEach(() => { vi.clearAllMocks(); resetPublicFormRateLimitForTests(); });

  it("rejects malformed booking, enquiry, newsletter, and search inputs before persistence", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.bookings.create({ tourTitle: "Triund", guestName: "A", email: "not-an-email", phone: "123", travellers: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.enquiries.create({ name: "A", email: "traveller@example.com", subject: "", message: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.newsletter.subscribe({ email: "invalid" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.tours.search({ query: "x" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.enquiries.create({ name: "Asha", email: "not-an-email", subject: "Hi", message: "x" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("persists validated booking and homepage enquiry records, then returns confirmation responses", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.bookings.create({
      tourId: 4,
      tourTitle: "Triund Sunrise Trek",
      guestName: "Asha Mehta",
      email: "asha@example.com",
      phone: "+919876543210",
      travellers: 2,
    })).resolves.toEqual({ success: true });
    expect(db.createBooking).toHaveBeenCalledWith({
      tourId: 4,
      tourTitle: "Triund Sunrise Trek",
      guestName: "Asha Mehta",
      email: "asha@example.com",
      phone: "+919876543210",
      travellers: 2,
      travelDate: null,
      message: null,
    });

    await expect(caller.enquiries.create({
      name: "Asha Mehta",
      email: "asha@example.com",
      subject: "Homepage trip enquiry",
      message: "Two travellers planning a guided Dharamshala trek this autumn.",
    })).resolves.toEqual({ success: true });
    expect(db.createEnquiry).toHaveBeenCalledWith({
      name: "Asha Mehta",
      email: "asha@example.com",
      subject: "Homepage trip enquiry",
      message: "Two travellers planning a guided Dharamshala trek this autumn.",
      phone: null,
    });
  });

  it("accepts a one-character visitor enquiry without imposing an artificial word limit", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.enquiries.create({ name: "Asha", email: "asha@example.com", subject: "Hi", message: "H" })).resolves.toEqual({ success: true });
    expect(db.createEnquiry).toHaveBeenLastCalledWith({
      name: "Asha",
      email: "asha@example.com",
      subject: "Hi",
      message: "H",
      phone: null,
    });
  });
});

describe("principal setup repair", () => {
  beforeEach(() => vi.clearAllMocks());

  it("credential-enables the existing owner record instead of attempting a duplicate-email account", async () => {
    const owner = { ...createContext("principal").user!, passwordHash: null, name: "Project owner", email: "owner@example.com" };
    vi.mocked(db.credentialAdminExists).mockResolvedValue(false);
    vi.mocked(db.getUserByEmail).mockResolvedValue(owner);
    vi.mocked(db.enableExistingPrincipalCredential).mockResolvedValue({ ...owner, name: "Mainul Islam", passwordHash: "scrypt$salt$hash" });
    const ctx = createContext("visitor");
    const cookie = vi.fn();
    ctx.res = { clearCookie: () => undefined, cookie } as TrpcContext["res"];
    const caller = appRouter.createCaller(ctx);
    await expect(caller.adminAuth.setupPrincipal({ name: "Mainul Islam", email: "owner@example.com", password: "A_secure_password_2026" })).resolves.toEqual({ success: true, role: "principal" });
    expect(db.enableExistingPrincipalCredential).toHaveBeenCalledWith(expect.objectContaining({ id: owner.id, email: "owner@example.com", name: "Mainul Islam" }));
    expect(cookie).toHaveBeenCalledWith(expect.any(String), "secure-principal-session", expect.objectContaining({ httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 24 * 14 }));
  });

  it("creates the first principal account for a standalone local database with no platform owner row", async () => {
    const principal = { ...createContext("principal").user!, name: "Mainul", email: "mainul@example.com", passwordHash: "scrypt$salt$hash" };
    vi.mocked(db.credentialAdminExists).mockResolvedValue(false);
    vi.mocked(db.getUserByEmail).mockResolvedValueOnce(undefined).mockResolvedValueOnce(principal);
    vi.mocked(db.createCredentialAdmin).mockResolvedValue(undefined);
    const ctx = createContext("visitor");
    const cookie = vi.fn();
    ctx.res = { clearCookie: () => undefined, cookie } as TrpcContext["res"];

    const caller = appRouter.createCaller(ctx);
    await expect(caller.adminAuth.setupPrincipal({ name: "Mainul", email: "mainul@example.com", password: "A_secure_password_2026" })).resolves.toEqual({ success: true, role: "principal" });

    expect(db.createCredentialAdmin).toHaveBeenCalledWith(expect.objectContaining({ name: "Mainul", email: "mainul@example.com", role: "principal", passwordHash: expect.any(String) }));
    expect(cookie).toHaveBeenCalledWith(expect.any(String), "secure-principal-session", expect.any(Object));
  });

  it("promotes a password-less standalone local user record when no credential administrator exists", async () => {
    const importedLocalUser = { ...createContext("user").user!, passwordHash: null, name: "Mainul", email: "mainul@example.com" };
    const principal = { ...importedLocalUser, role: "principal" as const, passwordHash: "scrypt$salt$hash" };
    vi.mocked(db.credentialAdminExists).mockResolvedValue(false);
    vi.mocked(db.getUserByEmail).mockResolvedValue(importedLocalUser);
    vi.mocked(db.enableExistingPrincipalCredential).mockResolvedValue(principal);
    const ctx = createContext("visitor");
    const cookie = vi.fn();
    ctx.res = { clearCookie: () => undefined, cookie } as TrpcContext["res"];

    await expect(appRouter.createCaller(ctx).adminAuth.setupPrincipal({ name: "Mainul Islam", email: "mainul@example.com", password: "A_secure_password_2026" })).resolves.toEqual({ success: true, role: "principal" });

    expect(db.enableExistingPrincipalCredential).toHaveBeenCalledWith(expect.objectContaining({ id: importedLocalUser.id, name: "Mainul Islam", email: "mainul@example.com" }));
    expect(cookie).toHaveBeenCalledWith(expect.any(String), "secure-principal-session", expect.any(Object));
  });
});

describe("principal administrator boundary", () => {
  it("denies administrator-directory access to a non-principal administrator", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.admin.admins()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("verified review management", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows an administrator to save a verified traveller review with a rating and optional photo", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.reviews.create({
      reviewerName: "Asha Mehta",
      location: "Delhi, India",
      reviewerImage: "/manus-storage/tour-media/2/asha.jpg",
      rating: 5,
      quote: "A clear plan and a very good Triund experience.",
      sourceLabel: "Direct message",
      isPublished: true,
    })).resolves.toEqual({ success: true });
    expect(db.createReview).toHaveBeenCalledWith({
      reviewerName: "Asha Mehta",
      location: "Delhi, India",
      reviewerImage: "/manus-storage/tour-media/2/asha.jpg",
      rating: 5,
      quote: "A clear plan and a very good Triund experience.",
      sourceLabel: "Direct message",
      isPublished: true,
    });
  });

  it("rejects invalid star ratings and blocks visitor review creation", async () => {
    const admin = appRouter.createCaller(createContext("admin"));
    const visitor = appRouter.createCaller(createContext("visitor"));
    const review = { reviewerName: "Asha", rating: 5, quote: "A real traveller comment.", isPublished: false };
    await expect(admin.reviews.create({ ...review, rating: 6 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(visitor.reviews.create(review)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("administrator media upload", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts validated PNG bytes from an administrator and persists the managed-storage reference", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]).toString("base64");
    await expect(caller.media.upload({ filename: "triund-view.png", mimeType: "image/png", dataBase64: png })).resolves.toEqual({ success: true, asset: { url: "/manus-storage/tour-media/2/demo_abc123.png", filename: "triund-view.png" } });
    expect(db.createMediaAsset).toHaveBeenCalledWith(expect.objectContaining({
      storageKey: "tour-media/2/demo_abc123.png",
      url: "/manus-storage/tour-media/2/demo_abc123.png",
      filename: "triund-view.png",
      mimeType: "image/png",
      uploadedBy: 2,
    }));
  });

  it("rejects invalid image bytes before managed storage is called", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.media.upload({ filename: "not-a-photo.png", mimeType: "image/png", dataBase64: Buffer.from("not an image").toString("base64") })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("denies both visitor and unauthenticated access to the media library", async () => {
    const visitor = appRouter.createCaller(createContext("visitor"));
    await expect(visitor.media.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(visitor.media.upload({ filename: "triund.png", mimeType: "image/png", dataBase64: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]).toString("base64") })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(visitor.media.remove({ id: 7 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const anonymous = appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} }, res: { clearCookie: () => undefined } } as TrpcContext);
    await expect(anonymous.media.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(anonymous.media.remove({ id: 7 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows an administrator to remove an unused library photo but protects a photo assigned to a journey", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    vi.mocked(db.removeUnusedMediaAsset).mockResolvedValueOnce({ removed: true });
    await expect(caller.media.remove({ id: 14 })).resolves.toEqual({ success: true });
    expect(db.removeUnusedMediaAsset).toHaveBeenCalledWith(14);

    vi.mocked(db.removeUnusedMediaAsset).mockResolvedValueOnce({ removed: false, reason: "in-use" });
    await expect(caller.media.remove({ id: 15 })).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("tour gallery management", () => {
  beforeEach(() => vi.clearAllMocks());

  it("persists a selected multi-photo gallery in the order chosen by an administrator", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const photos = ["/manus-storage/tour-media/2/triund-cover.webp", "/manus-storage/tour-media/2/triund-camp.webp", "/manus-storage/tour-media/2/triund-sunrise.webp"];
    await expect(caller.tours.create({
      title: "Triund Sunrise Trek", slug: "triund-sunrise-trek", category: "Trekking", location: "Dharamshala, Himachal Pradesh", duration: "2 Days / 1 Night", difficulty: "Easy", priceFrom: 3200,
      heroImage: photos[0]!, gallery: photos,
      shortDescription: "A carefully paced sunrise trek from Dharamshala with local mountain guides.",
      overview: "Walk through cedar forests to Triund with a local guide, a relaxed camp evening, and a memorable Himalayan sunrise.",
      highlights: ["Triund sunrise", "Local guide"], itinerary: [{ day: "Day 1", title: "Walk to Triund", description: "Meet the guide and walk through the forest to the campsite." }],
      inclusions: ["Local guide"], exclusions: ["Personal purchases"], isPublished: true, isFeatured: true, featureOrder: 1,
    })).resolves.toEqual({ success: true });
    expect(db.createTour).toHaveBeenCalledWith(expect.objectContaining({ heroImage: photos[0], gallery: photos }));
  });

  it("allows an administrator to save an unfinished named journey as a draft but requires complete details before publishing", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const draft = {
      title: "New Dharamshala Journey",
      slug: "new-dharamshala-journey",
      category: "Trekking",
      location: "Dharamshala, Himachal Pradesh",
      duration: "2 Days / 1 Night",
      difficulty: "Easy–Moderate",
      priceFrom: 2500,
      heroImage: "/manus-storage/tour-media/2/draft-cover.webp",
      gallery: ["/manus-storage/tour-media/2/draft-cover.webp"],
      shortDescription: "",
      overview: "",
      highlights: [],
      itinerary: [],
      inclusions: [],
      exclusions: [],
      isFeatured: false,
      featureOrder: 0,
    };

    await expect(caller.tours.create({ ...draft, isPublished: false })).resolves.toEqual({ success: true });
    await expect(caller.tours.create({ ...draft, isPublished: true })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts long administrator-managed tour and field-note content without word-count limits", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const longText = "Detailed local route guidance. ".repeat(800);
    const photo = "/manus-storage/tour-media/2/triund-cover.webp";

    await expect(caller.tours.create({
      title: longText,
      slug: "long-form-triund-guide",
      category: "Trekking",
      location: "Dharamshala, Himachal Pradesh",
      duration: "2 Days / 1 Night",
      difficulty: "Easy",
      priceFrom: 3200,
      heroImage: photo,
      gallery: [photo],
      shortDescription: longText,
      overview: longText,
      highlights: [`Route note: ${longText}`],
      itinerary: [{ day: "Day 1", title: longText, description: longText }],
      inclusions: [longText],
      exclusions: [longText],
      isPublished: false,
      isFeatured: false,
      featureOrder: 1,
    })).resolves.toEqual({ success: true });
    const expectedLength = longText.trim().length;
    const savedTour = vi.mocked(db.createTour).mock.calls[0]?.[0];
    expect(savedTour?.title.length).toBe(expectedLength);
    expect(savedTour?.overview.length).toBe(expectedLength);

    await expect(caller.blogs.create({
      title: longText,
      slug: "long-form-local-field-note",
      excerpt: longText,
      content: longText,
      coverImage: photo,
      author: longText,
      isPublished: false,
    })).resolves.toEqual({ success: true });
    const savedBlog = vi.mocked(db.createBlog).mock.calls[0]?.[0];
    expect(savedBlog?.title.length).toBe(expectedLength);
    expect(savedBlog?.content.length).toBe(expectedLength);
    expect(savedBlog?.author.length).toBe(expectedLength);
  });
});
