import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

describe("Next.js and Hostinger deployment contract", () => {
  it("uses Next.js production scripts while retaining a safe install-only build fallback", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.dev).toBe("next dev");
    expect(pkg.scripts.build).toBe("next build");
    expect(pkg.scripts.start).toBe("next start");
    expect(pkg.scripts.postinstall).toBe("npm run build");
  });

  it("ships an App Router shell and node-runtime tRPC handler for public and protected legacy routes", () => {
    const routeShell = fs.readFileSync(path.join(root, "app/[[...path]]/page.tsx"), "utf8");
    const apiRoute = fs.readFileSync(path.join(root, "app/api/trpc/[trpc]/route.ts"), "utf8");
    const nextConfig = fs.readFileSync(path.join(root, "next.config.mjs"), "utf8");
    expect(routeShell).toContain("LegacyClientApp");
    expect(apiRoute).toContain("fetchRequestHandler");
    expect(apiRoute).toContain('runtime = "nodejs"');
    expect(nextConfig).toContain('output: "standalone"');
  });

  it("documents the required Next.js Web App deployment instead of static Vite or Express hosting", () => {
    const guide = fs.readFileSync(path.join(root, "HOSTINGER_DEPLOYMENT.md"), "utf8");
    expect(guide).toContain("Framework preset | **Next.js**");
    expect(guide).toContain("npm run build");
    expect(guide).toContain("npm start");
    expect(guide).toContain("Do not select **Vite**, **Express**, or **Other**");
    expect(guide).toContain("DATABASE_URL");
  });
});
