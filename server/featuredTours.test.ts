import { describe, expect, it } from "vitest";
import { selectTopFeaturedTours } from "../client/src/lib/featuredTours";

describe("homepage Top 4 journeys", () => {
  it("keeps only the four administrator-featured tours in their configured rank order", () => {
    const result = selectTopFeaturedTours([
      { id: "five", isFeatured: true, featureOrder: 5 },
      { id: "two", isFeatured: true, featureOrder: 2 },
      { id: "draft", isFeatured: false, featureOrder: 1 },
      { id: "four", isFeatured: true, featureOrder: 4 },
      { id: "one", isFeatured: true, featureOrder: 1 },
      { id: "three", isFeatured: true, featureOrder: 3 },
    ]);

    expect(result.map(tour => tour.id)).toEqual(["one", "two", "three", "four"]);
  });
});
