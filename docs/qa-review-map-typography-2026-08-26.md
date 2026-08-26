# QA Findings — Review, Map, and CTA Typography

Date: 2026-08-26

The desktop and mobile homepage screenshots confirm that the reference-inspired traveller feedback layout is responsive, authentic review text remains visible, no public star/rating/count/verification metrics are rendered, and the PLAN YOUR HIMACHAL TRIP heading remains readable with the intended bold lower-page heading treatment.

The public location section renders a responsive iframe container and an accessible “Open Trip Himalaya in Google Maps” fallback link. The sandbox screenshot does not render third-party Google Maps tiles inside the iframe, while direct GET checks for the Google embed endpoint returned HTTP 200. This appears to be an external browser/preview rendering limitation rather than an application compile or routing error; the fallback link remains available for visitors.

Validation recorded: 36 Vitest files / 106 tests passed, TypeScript passed, production build passed, desktop screenshot passed, and mobile screenshot passed.
