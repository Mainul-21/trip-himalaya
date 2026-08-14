import { beforeEach, describe, expect, it, vi } from "vitest";
import * as db from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createBooking: vi.fn(),
  createEnquiry: vi.fn(),
}));

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
  beforeEach(() => vi.clearAllMocks());

  it("rejects malformed booking, enquiry, newsletter, and search inputs before persistence", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.bookings.create({ tourTitle: "Triund", guestName: "A", email: "not-an-email", phone: "123", travellers: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.enquiries.create({ name: "A", email: "traveller@example.com", subject: "Hi", message: "Too short" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.newsletter.subscribe({ email: "invalid" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.tours.search({ query: "x" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
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
});

describe("principal administrator boundary", () => {
  it("denies administrator-directory access to a non-principal administrator", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.admin.admins()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
