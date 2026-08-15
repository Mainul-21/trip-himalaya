import { describe, expect, it } from "vitest";
import { getManagedAssetFallbackUrl } from "./_core/storageProxy";

describe("managed image fallback", () => {
  it("routes existing managed image keys through the public project endpoint", () => {
    expect(getManagedAssetFallbackUrl("triund-hikers_7653a06a.jpg")).toBe(
      "https://himalayatrip-ahqqbylp.manus.space/manus-storage/triund-hikers_7653a06a.jpg",
    );
  });

  it("keeps nested keys as path segments while safely encoding each segment", () => {
    expect(getManagedAssetFallbackUrl("gallery/triund camp.jpg")).toBe(
      "https://himalayatrip-ahqqbylp.manus.space/manus-storage/gallery/triund%20camp.jpg",
    );
  });
});
