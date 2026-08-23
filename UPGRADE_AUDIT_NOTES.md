# Premium Upgrade Audit Notes

## Baseline audit — 23 August 2026

The public site has an established navy-and-saffron visual system, working public routes, administrator-managed agency settings, and a genuine published-review workflow. The database contained **one published review** at audit time; therefore the feedback presentation must show only this database content, calculate its average only from published rows, and use an administrator-configured external review destination without asserting Google verification, endorsement, counts, or ratings.

The pre-upgrade homepage relied on a simple lazy-route spinner and exposed a small floating WhatsApp icon without a companion direct-call control. The dedicated `/reviews` route now uses the existing published review data, an honest data-origin disclosure, a genuine external CTA only when configured, and a practical Call / WhatsApp / Get a Quote conversion path.

Desktop review-page inspection confirmed that the new header, review summary, published guest card, external review link, and conversion cards render without overlap at 1280 pixels wide. The 375-pixel review-page check confirmed a readable stacked feedback card, full-width conversion choices, and intact footer links. The 1280-pixel homepage check confirmed that the expanded Reviews navigation, Call Now action, Get a Quote action, and floating contact controls remain visible without covering the hero message.

The release validation passed 33 test files and 96 tests, TypeScript checking, and the Vite/Express production build. Production output now separates the initial application, data client, route modules, and framework vendor code so long-lived browser cache entries can be reused between route changes. The framework vendor chunk remains sizeable and should be evaluated again only if future product scope makes a separate React/runtime optimisation worthwhile.

Tablet inspection initially identified that fixed desktop contact controls could partially cover the external-review CTA. The controls are now intentionally desktop-only; tablet and mobile navigation exposes Call Now, WhatsApp, and Get a Quote actions in its responsive menu instead, removing the content overlap while preserving direct contact paths.
