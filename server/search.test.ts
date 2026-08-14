import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ searchPublicContent: vi.fn() }));
vi.mock("./db", () => ({ searchPublicContent: mocks.searchPublicContent }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined, cookie: () => undefined } as TrpcContext["res"],
  };
}

describe("public search", () => {
  it("returns tour, trek, and blog matches from the public search contract", async () => {
    const expected = {
      tours: [
        { id: 1, title: "Triund Sunrise Trek", category: "Trekking" },
        { id: 2, title: "Dharamshala Culture & Monasteries", category: "Experiences" },
      ],
      blogs: [{ id: 3, title: "Preparing for a Dharamshala Trek", slug: "prepare-dharamshala-trek" }],
    };
    mocks.searchPublicContent.mockResolvedValueOnce(expected);

    const result = await appRouter.createCaller(createPublicContext()).tours.search({ query: "Dharamshala" });

    expect(mocks.searchPublicContent).toHaveBeenCalledWith("Dharamshala");
    expect(result).toEqual(expected);
    expect(result.tours.some(item => item.category === "Trekking")).toBe(true);
    expect(result.blogs).toHaveLength(1);
  });

  it("returns an explicit empty result collection when no public content matches", async () => {
    mocks.searchPublicContent.mockResolvedValueOnce({ tours: [], blogs: [] });
    const result = await appRouter.createCaller(createPublicContext()).tours.search({ query: "Kinnaur" });
    expect(result).toEqual({ tours: [], blogs: [] });
  });
});
