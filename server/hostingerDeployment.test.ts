import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

describe("Hostinger deployment contract", () => {
  it("ships an Apache SPA fallback that keeps API requests separate from client routes", () => {
    const config = fs.readFileSync(path.join(root, "client/public/.htaccess"), "utf8");

    expect(config).toContain("RewriteEngine On");
    expect(config).toContain("RewriteRule ^api(?:/|$) - [L]");
    expect(config).toContain("RewriteRule ^ index.html [L]");
    expect(config).toContain("RewriteCond %{REQUEST_FILENAME} -f [OR]");
  });

  it("documents the full Node deployment required by the protected administrator portal", () => {
    const guide = fs.readFileSync(path.join(root, "HOSTINGER_DEPLOYMENT.md"), "utf8");
    const environment = fs.readFileSync(path.join(root, "HOSTINGER_ENV.example"), "utf8");

    expect(guide).toContain("npm run build");
    expect(guide).toContain("dist/index.js");
    expect(guide).toContain("/api/trpc");
    expect(guide).toContain("static-only");
    expect(environment).toContain("DATABASE_URL=");
    expect(environment).toContain("JWT_SECRET=");
    expect(environment).toContain("CLOUDINARY_URL=");
  });

  it("uses the committed npm lockfile and no pnpm workspace policy for the Hostinger deployment", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      packageManager: string;
    };
    const guide = fs.readFileSync(path.join(root, "HOSTINGER_DEPLOYMENT.md"), "utf8");
    const npmConfig = fs.readFileSync(path.join(root, ".npmrc"), "utf8");

    expect(pkg.packageManager).toBe("npm@10.9.2");
    expect(fs.existsSync(path.join(root, "package-lock.json"))).toBe(true);
    expect(fs.existsSync(path.join(root, "pnpm-lock.yaml"))).toBe(false);
    expect(fs.existsSync(path.join(root, "pnpm-workspace.yaml"))).toBe(false);
    expect(guide).toContain("npm ci");
    expect(guide).toContain("dist/index.js");
    expect(npmConfig).toContain("include=dev");
  });

  it("builds the Express bundle after npm installation when a host invokes only the install stage", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(pkg.scripts.preinstall).toBeUndefined();
    expect(pkg.scripts.postinstall).toBe("npm run build");
    expect(pkg.scripts.build).toContain("esbuild");
  });
});
