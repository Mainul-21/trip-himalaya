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

    expect(guide).toContain("pnpm build");
    expect(guide).toContain("dist/index.js");
    expect(guide).toContain("/api/trpc");
    expect(guide).toContain("static-only");
    expect(environment).toContain("DATABASE_URL=");
    expect(environment).toContain("JWT_SECRET=");
    expect(environment).toContain("CLOUDINARY_URL=");
  });

  it("uses a copy-based pnpm import policy so native build binaries retain executable permissions", () => {
    const workspace = fs.readFileSync(path.join(root, "pnpm-workspace.yaml"), "utf8");
    const guide = fs.readFileSync(path.join(root, "HOSTINGER_DEPLOYMENT.md"), "utf8");

    expect(workspace).toContain("packageImportMethod: copy");
    expect(workspace).toContain("'@tailwindcss/oxide': true");
    expect(workspace).toContain("esbuild: true");
    expect(guide).toContain("packageImportMethod: copy");
    expect(guide).toContain("dist/index.js");
  });

  it("retains the requested recursive postinstall chmod 755 permission normalization without disabling scripts", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(pkg.scripts.postinstall).toContain("chmod -R 755 node_modules/.bin");
    expect(pkg.scripts.postinstall).toContain("chmod -R 755 node_modules/*/bin");
    expect(pkg.scripts.postinstall).toContain("chmod -R 755 node_modules/esbuild/bin");
    expect(pkg.scripts.postinstall).toContain("node_modules/*/node_modules/esbuild/bin");
    expect(pkg.scripts.postinstall).not.toContain("unsafe-perm");
  });

  it("retains the requested recursive preinstall chmod 755 permission normalization without deleting the lockfile contract", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(pkg.scripts.preinstall).toContain("chmod -R 755 node_modules/.bin");
    expect(pkg.scripts.preinstall).toContain("node_modules/*/node_modules/esbuild/bin");
    expect(pkg.scripts.preinstall).not.toContain("unsafe-perm");
  });
});
