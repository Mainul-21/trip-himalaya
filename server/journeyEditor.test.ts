import { describe, expect, it } from "vitest";
import {
  addJourneyDay,
  addJourneyItem,
  cleanJourneyDetails,
  removeJourneyDay,
  removeJourneyItem,
  updateJourneyDay,
  updateJourneyItem,
} from "../client/src/lib/journeyEditor";

describe("box-based journey editor mapping", () => {
  it("adds, edits, and removes individual detail boxes without changing other items", () => {
    const highlights = addJourneyItem(["Sunrise views"], " Local guide ");
    expect(highlights).toEqual(["Sunrise views", "Local guide"]);
    expect(updateJourneyItem(highlights, 0, "Valley views")).toEqual(["Valley views", "Local guide"]);
    expect(removeJourneyItem(highlights, 1)).toEqual(["Sunrise views"]);
  });

  it("maps complete boxes into a clean payload for a published journey and excludes unfinished boxes", () => {
    const days = addJourneyDay([{ day: "Day 1", title: "Walk to Triund", description: "Forest trail" }]);
    const completeDays = updateJourneyDay(days, 1, { title: "Camp at Triund", description: "Settle in before sunset" });
    const details = cleanJourneyDetails({
      highlights: [" Sunrise views ", ""],
      itinerary: removeJourneyDay([...completeDays, { day: "Day 3", title: "", description: "" }], 2),
      inclusions: [" Local guide ", ""],
      exclusions: [" Personal insurance "],
    });
    expect(details).toEqual({
      highlights: ["Sunrise views"],
      itinerary: [
        { day: "Day 1", title: "Walk to Triund", description: "Forest trail" },
        { day: "Day 2", title: "Camp at Triund", description: "Settle in before sunset" },
      ],
      inclusions: ["Local guide"],
      exclusions: ["Personal insurance"],
    });
  });
});
