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
    expect(db).toContain("databaseNeedsAttention");
    expect(db).toContain("using safe fallback");
    expect(db).toContain("isMissingAgencyBrandingColumn");
    expect(db).toContain("touristCount|tourCount|thirdMetricLabel|thirdMetricValue");
    expect(db).toContain("googleMapsUrl: agencyProfiles.googleMapsUrl");
    expect(schema).toContain('touristCount: varchar("touristCount"');
    expect(schema).toContain('tourCount: varchar("tourCount"');
    expect(schema).toContain('thirdMetricLabel: varchar("thirdMetricLabel"');
    expect(schema).toContain('thirdMetricValue: varchar("thirdMetricValue"');
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
    expect(portal).toContain('>Travel styles</h2>');
    expect(portal).toContain('Edit the heading, intro, and cards.');
    expect(portal).toContain('one JSON object per card with title, href, image, and copy');
    expect(portal).toContain('name="touristCount"');
    expect(portal).toContain('name="tourCount"');
    expect(portal).toContain('name="thirdMetricLabel"');
    expect(portal).toContain('name="thirdMetricValue"');
    expect(portal).toContain("retry: false");
    expect(portal).toContain("One safe local database update is needed");
    expect(portal).toContain("Connect the local database to edit this profile");
    expect(portal).toContain("databaseNeedsAttention");
    expect(portal).toContain("Try again");
  });
});
