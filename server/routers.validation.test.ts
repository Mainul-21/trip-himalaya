import { beforeEach, describe, expect, it, vi } from "vitest";
import * as db from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { resetPublicFormRateLimitForTests } from "./publicFormRateLimit";

vi.mock("./db", () => ({
  createBooking: vi.fn(),
  createEnquiry: vi.fn(),
  createMediaAsset: vi.fn(),
  listMediaAssets: vi.fn(),
  credentialAdminExists: vi.fn(),
  getUserByEmail: vi.fn(),
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
});

describe("principal administrator boundary", () => {
  it("denies administrator-directory access to a non-principal administrator", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.admin.admins()).rejects.toMatchObject({ code: "FORBIDDEN" });
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
    const anonymous = appRouter.createCaller({ user: null, req: { protocol: "https", headers: {} }, res: { clearCookie: () => undefined } } as TrpcContext);
    await expect(anonymous.media.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
