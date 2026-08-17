# Visual QA Verification

## Focused refinements — 17 August 2026

The public homepage, tour catalogue, and administrator sign-in screen were checked at a 1280×720 desktop viewport and a 375×812 mobile viewport. The official Trip Himalaya logo is visible in the public header, mobile header, footer, and administrator sign-in card. The shared branding fallback keeps these surfaces consistent when agency-profile data is unavailable.

On the mobile tour catalogue, the tour-card price block sits below the duration metadata and above the action controls. Prices, metadata, gallery controls, and the two card actions remained visibly separated across all displayed cards, with no overlap observed. The mobile header retained the compact Trip Himalaya brand mark, a visible planning call to action, and the navigation control.

Authenticated principal-administrator editing could not be visually exercised without credentials. Its dedicated regression test confirms that the UI exposes the inline name, email, optional-password, status, and removal controls only for subordinate administrator accounts, while the server retains principal-only permission checks.
