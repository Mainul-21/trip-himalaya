import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const db = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const portal = readFileSync(new URL("../client/src/pages/AdminPortal.tsx", import.meta.url), "utf8");

describe("agency profile administration contract", () => {
  it("persists one structured public profile with logo, contact, and social profile fields", () => {
    expect(schema).toContain('agencyProfiles = mysqlTable("agencyProfiles"');
    expect(schema).toContain('instagramUrl: varchar("instagramUrl"');
    expect(schema).toContain('googleMapsUrl: varchar("googleMapsUrl"');
    expect(db).toContain("DEFAULT_AGENCY_PROFILE");
    expect(db).toContain("updateAgencyProfile");
    expect(schema).toContain('travelStylesJson: text("travelStylesJson")');
    expect(db).toContain("JSON.stringify(travelStyles)");
    expect(db).toContain("DEFAULT_TRAVEL_STYLES");
    expect(db).toContain("schemaNeedsUpdate");
    expect(db).toContain("isMissingAgencyBrandingColumn");
  });

  it("keeps public reads open and restricts profile updates to authenticated administrators", () => {
    expect(router).toContain("agency: router({");
    expect(router).toContain("get: publicProcedure.query(() => db.getAgencyProfile())");
    expect(router).toContain("update: adminProcedure.input(agencyProfileInput)");
  });

  it("provides clear portal controls for logo, contact, and social profile updates", () => {
    expect(portal).toContain('view === "agency"');
    expect(portal).toContain('title="Agency profile"');
    expect(portal).toContain("Save public agency profile");
    expect(portal).toContain("Public profiles");
    expect(portal).toContain('name="exploreTitle"');
    expect(portal).toContain('name="exploreIntro"');
    expect(portal).toContain('name="travelStyles"');
    expect(portal).toContain("retry: false");
    expect(portal).toContain("One safe local database update is needed");
    expect(portal).toContain("Try again");
  });
});
