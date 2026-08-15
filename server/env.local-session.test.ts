import { afterEach, describe, expect, it, vi } from "vitest";
import { LOCAL_CREDENTIAL_APP_ID, getSessionAppId } from "./_core/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSessionAppId", () => {
  it("uses a stable local identifier when no OAuth application identifier is configured", () => {
    vi.stubEnv("VITE_APP_ID", "");

    expect(getSessionAppId()).toBe(LOCAL_CREDENTIAL_APP_ID);
  });

  it("uses the configured application identifier when one is available", () => {
    vi.stubEnv("VITE_APP_ID", "  trip-himalaya-production  ");

    expect(getSessionAppId()).toBe("trip-himalaya-production");
  });
});
