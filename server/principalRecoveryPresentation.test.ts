import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("principal password recovery contract", () => {
  it("requires the setup secret, scopes attempts, revokes existing sessions, and never issues a new session", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("recoverPrincipalPassword");
    expect(router).toContain('scope: "principal-password-recovery", maxRequests: 3');
    expect(router).toContain("matchesInitialSetupKey(ENV.initialAdminSetupKey, input.setupKey)");
    expect(router).toContain('user.role !== "principal"');
    expect(router).toContain("lastSignedIn: new Date()");
    expect(router).toContain("ctx.res.clearCookie(COOKIE_NAME");
    expect(router).not.toMatch(/recoverPrincipalPassword[\s\S]{0,1000}createSessionToken/);
  });

  it("keeps recovery separate from sign-in and only submits the secret to the same-origin tRPC mutation", () => {
    const app = read("client/src/App.tsx");
    const login = read("client/src/pages/AdminLogin.tsx");
    const recovery = read("client/src/pages/AdminRecovery.tsx");
    expect(app).toContain('path="/admin/recover"');
    expect(login).toContain('href="/admin/recover"');
    expect(recovery).toContain("trpc.adminAuth.recoverPrincipalPassword.useMutation()");
    expect(recovery).toContain("autoComplete=\"off\"");
    expect(recovery).toContain('setLocation("/admin/login")');
  });
});
