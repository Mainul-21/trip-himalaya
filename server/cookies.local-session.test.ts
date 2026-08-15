import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";

function request(protocol: "http" | "https", forwardedProto?: string) {
  return {
    protocol,
    headers: forwardedProto ? { "x-forwarded-proto": forwardedProto } : {},
  } as Parameters<typeof getSessionCookieOptions>[0];
}

describe("getSessionCookieOptions", () => {
  it("uses a localhost-compatible cookie configuration over HTTP", () => {
    expect(getSessionCookieOptions(request("http"))).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });
  });

  it("retains Secure and SameSite=None for HTTPS deployments", () => {
    expect(getSessionCookieOptions(request("http", "https"))).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    });
  });
});
