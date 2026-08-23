import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../client/src/components/PublicLayout.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../client/src/pages/PrivacyPolicy.tsx", import.meta.url), "utf8");

describe("Privacy Policy page", () => {
  it("exposes a dedicated public privacy route from the footer", () => {
    expect(app).toContain('const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));');
    expect(app).toContain('<Route path="/privacy" component={PrivacyPolicy} />');
    expect(layout).toContain('<Link href="/privacy" className="hover:text-accent">Privacy Policy</Link>');
  });

  it("includes the owner-provided collection, use, sharing, security, cookies, and contact policy content", () => {
    expect(page).toContain("Information We Collect");
    expect(page).toContain("How We Use Your Information");
    expect(page).toContain("Data Sharing & Disclosure");
    expect(page).toContain("Data Security");
    expect(page).toContain("Cookies & Tracking");
    expect(page).toContain("Local Partners & Guides");
    expect(page).toContain("We do not sell, trade, or rent your personal information to third parties.");
    expect(page).toContain("Dharamshala, Himachal Pradesh, India");
    expect(page).toContain("+91 82196 28359");
    expect(page).toContain("triphimalayainfo@gmail.com");
    expect(page).toContain("https://triphimalya.com/");
  });
});
