import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("local stability guidance", () => {
  it("explains how to distinguish an unavailable catalogue from an empty result", () => {
    const toursPage = readProjectFile("client/src/pages/Tours.tsx");
    expect(toursPage).toContain("The journey catalogue is temporarily unavailable.");
    expect(toursPage).toContain("local database or network connection issue");
    expect(toursPage).toContain("Try again");
  });

  it("documents safe TiDB timeout and schema-drift recovery without destructive commands", () => {
    const guide = readProjectFile("LOCAL_TROUBLESHOOTING.md");
    expect(guide).toContain("Test-NetConnection");
    expect(guide).toContain("Do not repeatedly run migrations while the endpoint is unreachable");
    expect(guide).toContain("Do not select a truncate option");
    expect(guide).toContain("empty array means the API responded");
  });
});
