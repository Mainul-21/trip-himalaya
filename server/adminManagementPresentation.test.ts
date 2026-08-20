import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const portal = readFileSync(new URL("../client/src/pages/AdminPortal.tsx", import.meta.url), "utf8");
const tourCard = readFileSync(new URL("../client/src/components/TourCard.tsx", import.meta.url), "utf8");

describe("principal admin account management and tour-card presentation", () => {
  it("keeps create, edit, and delete actions principal-only and protects the main administrator", () => {
    expect(router).toContain("admins: principalProcedure.query");
    expect(router).toContain("createAdmin: principalProcedure.input");
    expect(router).toContain("updateAdmin: principalProcedure.input");
    expect(router).toContain("deleteAdmin: principalProcedure.input");
    expect(router).toContain('target.role === "principal"');
    expect(router).toContain("passwordHash: await hashPassword(input.password)");
    expect(router).toContain("Only a subordinate administrator can be removed.");
  });

  it("gives the principal an inline editor for subordinate name, email, optional password, access state, and removal", () => {
    expect(portal).toContain("function saveAdministrator");
    expect(portal).toContain("trpc.admin.updateAdmin.useMutation");
    expect(portal).toContain("Edit details");
    expect(portal).toContain("New password");
    expect(portal).toContain("Leave this blank to keep the current password");
    expect(portal).toContain("Disable access");
    expect(portal).toContain("Remove");
  });

  it("uses the supplied compact package layout while keeping the real price and both journey actions visible", () => {
    expect(tourCard).toContain('className="mt-2 flex items-end justify-between"');
    expect(tourCard).toContain('className="block text-base font-bold text-accent"');
    expect(tourCard).toContain("VIEW DETAILS");
    expect(tourCard).toContain("ENQUIRE NOW");
  });
});
