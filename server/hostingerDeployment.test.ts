import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

describe("deployment configuration", () => {
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

  it("pins the managed pnpm runtime and retains Vercel and deployment documentation", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      packageManager: string;
      devEngines?: { packageManager?: { name?: string; onFail?: string } };
    };
    const guide = fs.readFileSync(path.join(root, "HOSTINGER_DEPLOYMENT.md"), "utf8");
    const vercelGuide = fs.readFileSync(path.join(root, "VERCEL_DEPLOYMENT.md"), "utf8");
    const pnpmWorkspace = fs.readFileSync(path.join(root, "pnpm-workspace.yaml"), "utf8");

    expect(pkg.packageManager).toBe("pnpm@11.22.0");
    expect(pkg.devEngines?.packageManager?.name).toBe("pnpm");
    expect(pkg.devEngines?.packageManager?.onFail).toBe("warn");
    expect(fs.existsSync(path.join(root, "pnpm-lock.yaml"))).toBe(true);
    expect(pnpmWorkspace).toContain("allowBuilds:");
    expect(pnpmWorkspace).toContain("esbuild: true");
    expect(pnpmWorkspace).toContain("'@tailwindcss/oxide': true");
    expect(vercelGuide).toContain("pnpm install --frozen-lockfile");
    expect(vercelGuide).toContain("pnpm vercel:build");
    expect(guide).toContain("dist/index.js");
  });

  it("does not retain ineffective root permission hooks that run outside the failed package install stage", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(pkg.scripts.preinstall).toBeUndefined();
    expect(pkg.scripts.postinstall).toBeUndefined();
    expect(pkg.scripts.build).toContain("esbuild");
  });
});
