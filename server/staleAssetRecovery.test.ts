import { describe, expect, it } from "vitest";
import {
  claimStaleAssetReload,
  clearStaleAssetReload,
  isStaleAssetError,
  staleAssetReloadKey,
} from "../client/src/lib/staleAssetRecovery";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("stale route-asset recovery", () => {
  it("recognises the dynamic-import failure returned by a stale Vite route chunk", () => {
    expect(
      isStaleAssetError(
        new TypeError("Failed to fetch dynamically imported module: https://triphimalya.com/assets/Tours-CKKy0dhe.js")
      )
    ).toBe(true);
    expect(isStaleAssetError(new Error("Database request failed"))).toBe(false);
  });

  it("permits one automatic refresh per route and then prevents a refresh loop", () => {
    const storage = createStorage();

    expect(claimStaleAssetReload(storage, "/tours")).toBe(true);
    expect(storage.getItem(staleAssetReloadKey("/tours"))).toBe("1");
    expect(claimStaleAssetReload(storage, "/tours")).toBe(false);
    expect(claimStaleAssetReload(storage, "/admin/login")).toBe(true);
  });

  it("allows a deliberate manual retry after the guard is cleared", () => {
    const storage = createStorage();
    claimStaleAssetReload(storage, "/tours");

    clearStaleAssetReload(storage, "/tours");

    expect(claimStaleAssetReload(storage, "/tours")).toBe(true);
  });
});
