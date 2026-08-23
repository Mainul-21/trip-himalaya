import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

describe("supplied reference header and footer contract", () => {
  it("uses the requested white Himalayan-navy header while retaining an accessible phone menu", () => {
    expect(home).toContain("<PublicHeader profile={agency} />");
    expect(home).toContain("<PublicLayout showHeader={false}>");
    expect(source).toContain('className="relative z-50 isolate border-b border-[#0D2C5B]/10 bg-white/95 shadow-[0_8px_24px_rgba(13,44,91,.1)] backdrop-blur-xl"');
    expect(source).toContain('aria-controls="mobile-menu"');
    expect(source).toContain('aria-expanded={mobileOpen}');
    expect(source).toContain("lg:hidden");
    expect(source).toContain("top-full z-50");
    expect(source).toContain("Menu");
    expect(source).not.toContain("MoreVertical");
    expect(styles).toContain('@import "tailwindcss";');
    expect(source).toContain("flex items-center gap-2 sm:gap-3 lg:contents");
    expect(source).toContain('hidden border-b border-white/10 bg-[#0D2C5B] text-white lg:block');
    expect(source).toContain("Based in Himachal Pradesh");
    expect(source).toContain("lg:min-h-[5.25rem]");
    expect(source).toContain("lg:w-[210px]");
    expect(source).toContain("max-h-[calc(100dvh-4.25rem)]");
  });

  it("keeps essential navigation, a homepage Plan Your Trip action, and role-aware dashboard access", () => {
    expect(source).toContain('label: "HOME"');
    expect(source).toContain('label: "OUR STAY"');
    expect(source).not.toContain('label: "REVIEWS"');
    expect(source).toContain('const planHref = isHomepage ? "contact" : "/contact"');
    expect(source).toContain("PLAN YOUR TRIP");
    expect(source).toContain("!isHomepage ? <a href={phoneHref}");
    expect(source).toContain("rounded-full");
    expect(source).toContain('user ? <Link href="/admin"');
    expect(source).toContain("ADMIN DASHBOARD");
  });

  it("keeps the owner-supplied complete header logo, contact details, social hooks, footer geometry, and official WhatsApp glyph", () => {
    expect(source).toContain("OFFICIAL_TRIP_HIMALAYA_LOGO");
    expect(source).toContain("SUPPLIED_COMPLETE_HEADER_LOGO");
    expect(source).toContain("trip-himalaya-complete-logo_9a359425.jpg");
    expect(source).toContain("resolveImageUrl(profile.logoUrl)");
    expect(source).toContain("trpc.agency.get.useQuery");
    expect(source).toContain("CONTACT US");
    expect(source).toContain("profile.instagramUrl");
    expect(source).toContain("M17.472 14.382");
  });
});
