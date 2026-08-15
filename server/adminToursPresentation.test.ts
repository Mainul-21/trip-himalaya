import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../client/src/pages/AdminPortal.tsx", import.meta.url),
  "utf8"
);

describe("administrator journey presentation", () => {
  it("keeps the empty state separate from the protected journey-query loading and error states", () => {
    expect(source).toContain("const { data, isLoading, isError } = trpc.tours.adminList.useQuery()");
    expect(source).toContain("Loading journeys…");
    expect(source).toContain("Journeys could not be loaded. Refresh the page and try again.");
    expect(source).toContain("!isLoading && !isError && !tours.length");
  });
});
