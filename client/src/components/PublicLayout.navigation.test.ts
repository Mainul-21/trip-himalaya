import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./PublicLayout.tsx", import.meta.url), "utf8");

describe("PublicLayout mobile navigation contract", () => {
  it("keeps a phone-only accessible trigger and a scrollable overlay above public content", () => {
    expect(source).toContain('aria-controls="mobile-menu"');
    expect(source).toContain('aria-expanded={mobileOpen}');
    expect(source).toContain("lg:hidden");
    expect(source).toContain("fixed inset-x-0 top-[74px] z-50 max-h-[calc(100dvh-74px)] overflow-y-auto");
  });

  it("keeps all public links and the call, WhatsApp, and plan-your-trip actions inside the phone menu", () => {
    expect(source).toContain("navigation.map(([label, href])");
    expect(source).toContain('href="tel:+918609752814"');
    expect(source).toContain('href="https://wa.me/918609752814"');
    expect(source).toContain('href="/contact"');
    expect(source).toContain("onClick={() => setMobileOpen(false)}");
  });
});
