import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

describe("Vercel serverless bundle configuration", () => {
  it("builds the Express server into a self-contained API bundle", () => {
    const packageJson = readFileSync(resolve(root, "package.json"), "utf8");

    expect(packageJson).toContain('"vercel:build"');
    expect(packageJson).toContain("server/_core/app.ts");
    expect(packageJson).toContain("--bundle --format=cjs --target=node22 --outfile=api/_bundle.cjs");
  });

  it("loads the generated bundle from both Vercel API entrypoints", () => {
    for (const entrypoint of ["api/index.ts", "api/[...path].ts"]) {
      const source = readFileSync(resolve(root, entrypoint), "utf8");
      expect(source).toContain('createRequire(import.meta.url)');
      expect(source).toContain('require("./_bundle.cjs")');
      expect(source).not.toContain('from "../server/_core/index"');
    }
  });

  it("explicitly includes the generated bundle in every public API function", () => {
    const config = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));

    expect(config.functions["api/index.ts"].includeFiles).toBe("api/_bundle.cjs");
    expect(config.functions["api/[...path].ts"].includeFiles).toBe("api/_bundle.cjs");
    expect(readFileSync(resolve(root, ".gitignore"), "utf8")).toContain("api/_bundle.cjs");
  });
});
