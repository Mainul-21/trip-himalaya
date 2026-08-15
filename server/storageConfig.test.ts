import { describe, expect, it } from "vitest";
import { parseCloudinaryUrl } from "./storageConfig";

describe("parseCloudinaryUrl", () => {
  it("uses managed storage when no owner Cloudinary URL is configured", () => {
    expect(parseCloudinaryUrl("")).toBeNull();
  });

  it("parses a complete Cloudinary API Environment Variable", () => {
    expect(parseCloudinaryUrl("cloudinary://demo-key:demo-secret@trip-himalaya")).toEqual({
      apiKey: "demo-key",
      apiSecret: "demo-secret",
      cloudName: "trip-himalaya",
    });
  });

  it("rejects incomplete configuration without revealing a secret", () => {
    expect(() => parseCloudinaryUrl("https://not-cloudinary.example")).toThrow("CLOUDINARY_URL is incomplete");
  });
});
