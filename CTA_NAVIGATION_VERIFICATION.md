# Homepage CTA Navigation Verification

**Date:** 20 August 2026

The homepage hero was checked at both a 390 × 844 phone viewport and a 1280 × 720 desktop viewport after replacing the previous hash-route components with explicit in-page section navigation.

| Control | Destination | Verification result |
| --- | --- | --- |
| **Explore Tours** | `#packages` / Popular Treks & Tours | Visible, readable, and bound to smooth navigation through the `packages` section identifier. |
| **Plan Your Trip** | `#plan` / final enquiry form | Visible, readable, and bound to smooth navigation through the `plan` section identifier. |

Both hero controls retain the supplied reference presentation at phone and desktop sizes. Their target sections use a scroll margin so the fixed public header does not obscure the target heading after navigation. TypeScript validation and the focused homepage presentation regression passed.
