import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../client/src/pages/TourDetail.tsx", import.meta.url), "utf8");

describe("tour detail lower-section typography", () => {
  it("keeps the approved hero untouched while using enlarged readable typography below it", () => {
    expect(source).toContain('min-h-[30rem] overflow-hidden bg-[#123d5b] text-white');
    expect(source).toContain('text-[clamp(2.15rem,4vw,3.25rem)]');
    expect(source).toContain('text-[.98rem] leading-7 text-slate-600');
  });

  it("presents itinerary, lists, questions, and booking details as readable touch-friendly cards", () => {
    expect(source).toContain('rounded-2xl border border-[#dbe7e5] bg-white px-5 py-6');
    expect(source).toContain('rounded-[1.5rem] border border-[#d8e8e8] bg-[#f2f8f8]');
    expect(source).toContain('rounded-[1.5rem] border border-[#dbe7e5] bg-[#fbfcfb]');
    expect(source).toContain('text-4xl font-extrabold tracking-[-.03em] text-[#123d5b]');
  });
});
