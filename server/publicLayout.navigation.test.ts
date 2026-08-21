import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

describe("supplied reference header and footer contract", () => {
  it("places the literal transparent reference header inside the homepage hero while retaining an accessible phone menu", () => {
    expect(home).toContain("<PublicHeader profile={agency} />");
    expect(home).toContain("<PublicLayout showHeader={false}>");
    expect(source).toContain('className={`relative z-50 isolate ${isHomepage ? "" : "bg-primary"}`}');
    expect(source).toContain('aria-controls="mobile-menu"');
    expect(source).toContain('aria-expanded={mobileOpen}');
    expect(source).toContain("lg:hidden");
    expect(source).toContain("top-full z-50");
    expect(source).toContain("Menu");
    expect(source).not.toContain("MoreVertical");
    expect(styles).toContain('@import "tailwindcss";');
    expect(source).toContain("flex items-center gap-2 sm:gap-3 lg:contents");
  });

  it("keeps every supplied navigation item, the functional plan action, and role-aware dashboard access", () => {
    expect(source).toContain('label: "HOME"');
    expect(source).toContain('label: "OUR STAY"');
    expect(source).toContain('href={isHomepage ? "/contact" : "/contact"}');
    expect(source).toContain('user ? <Link href="/admin"');
    expect(source).toContain("ADMIN DASHBOARD");
  });

  it("keeps the supplied managed logo, contact details, social hooks, footer geometry, and official WhatsApp glyph", () => {
    expect(source).toContain("OFFICIAL_TRIP_HIMALAYA_LOGO");
    expect(source).toContain("resolveImageUrl(profile.logoUrl)");
    expect(source).toContain("trpc.agency.get.useQuery");
    expect(source).toContain("CONTACT US");
    expect(source).toContain("profile.instagramUrl");
    expect(source).toContain("M17.472 14.382");
  });
});
