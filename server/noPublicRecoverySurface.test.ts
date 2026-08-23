import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("public administrator access surface", () => {
  it("keeps standard email-and-password sign-in while exposing no public recovery route or procedure", () => {
    const app = read("client/src/App.tsx");
    const login = read("client/src/pages/AdminLogin.tsx");
    const router = read("server/routers.ts");
    const robots = read("client/public/robots.txt");

    expect(app).toContain('path="/admin/login"');
    expect(login).toContain("Sign in securely");
    expect(login).toContain("There is no public registration, password-reset path, or social sign-in.");
    expect(app).not.toContain("/admin/recover");
    expect(login).not.toContain("/admin/recover");
    expect(router).not.toContain("recoverPrincipalPassword");
    expect(robots).not.toContain("/admin/recover");
  });
});
