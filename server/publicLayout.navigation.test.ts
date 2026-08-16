import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");

describe("PublicLayout mobile navigation contract", () => {
  it("keeps a phone-only accessible trigger and a scrollable overlay above public content", () => {
    expect(source).toContain('aria-controls="mobile-menu"');
    expect(source).toContain('aria-expanded={mobileOpen}');
    expect(source).toContain("lg:hidden");
    expect(source).toContain("fixed inset-x-0 top-20 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto");
  });

  it("keeps all public links and the call, WhatsApp, and plan-your-trip actions inside the phone menu", () => {
    expect(source).toContain("navigation.map(([label, href])");
    expect(source).toContain("const phoneHref = `tel:${profile.phone.replace(/[^+0-9]/g, \"\")}`");
    expect(source).toContain("https://wa.me/${whatsappNumber}");
    expect(source).toContain('href="/contact"');
    expect(source).toContain("onClick={() => setMobileOpen(false)}");
  });

  it("shows a direct dashboard link in the desktop header only for a signed-in administrator", () => {
    expect(source).toContain('{user && <Link href="/admin"');
    expect(source).toContain("Admin dashboard");
  });

  it("uses the supplied logo and exposes saved public contact and social profile details in the footer", () => {
    expect(source).toContain("logo_triphimalaya_598a0ec2.jpg");
    expect(source).toContain("trpc.agency.get.useQuery");
    expect(source).toContain('>Contact</p>');
    expect(source).toContain("profile.instagramUrl");
  });
});
