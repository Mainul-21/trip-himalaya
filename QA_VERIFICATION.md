# Visual QA Verification

## Focused refinements — 17 August 2026

The public homepage, tour catalogue, and administrator sign-in screen were checked at a 1280×720 desktop viewport and a 375×812 mobile viewport. The official Trip Himalaya logo is visible in the public header, mobile header, footer, and administrator sign-in card. The shared branding fallback keeps these surfaces consistent when agency-profile data is unavailable.

On the mobile tour catalogue, the tour-card price block sits below the duration metadata and above the action controls. Prices, metadata, gallery controls, and the two card actions remained visibly separated across all displayed cards, with no overlap observed. The mobile header retained the compact Trip Himalaya brand mark, a visible planning call to action, and the navigation control.

Authenticated principal-administrator editing could not be visually exercised without credentials. Its dedicated regression test confirms that the UI exposes the inline name, email, optional-password, status, and removal controls only for subordinate administrator accounts, while the server retains principal-only permission checks.

## Live deployment check — 17 August 2026

The published Trip Himalaya domain was checked after its initial loader completed. The public homepage, hero, navigation, travel-style links, featured journey cards, enquiry form, footer, and public calls to action rendered successfully. This confirms that the domain is serving the application rather than a blank page or raw source.

One existing featured journey has the title `Hdhddhbd`, a zero price, and placeholder-style summary text. It should be reviewed and unpublished or corrected by an authenticated administrator before considering the production catalogue content-ready. This is a content-quality observation; no public tour record was altered during this verification.

The incomplete journey was subsequently unpublished and removed from the featured selection while retaining its database record for later administrator correction. A follow-up live catalogue check confirmed that only the four complete, priced journeys appear in public results and that the former `Hdhddhbd` entry is absent.

The live public `tours.list` endpoint was also requested directly. It returned structured JSON for the four published journeys, rather than the single-page application HTML fallback, confirming that the public catalogue is receiving API-backed data correctly on the published domain.

Desktop and mobile checks confirm that the About page now displays the concise heading “Our story” and that every shared WhatsApp call-to-action uses a recognizable speech-bubble-and-handset glyph. The floating WhatsApp action remains visibly distinct, has a screen-reader label, and retains the existing WhatsApp enquiry link.

An authenticated preview session reached `/admin/tours` directly at both desktop and mobile widths, with no redirect to the sign-in page. The journey list, publication-status badges, edit and deletion controls, and responsive Homepage Top Trips selectors were visible and readable. The previously unpublished placeholder journey remains available only as a draft in the protected workspace, confirming that the public-content correction did not delete administrator data.

The authenticated desktop Agency Profile view shows the now-optional Short tagline field, direct logo upload, and existing public-profile controls. The principal administrator directory shows the protected Add administrator, Edit details, Disable access, and Remove controls for a subordinate administrator, while the principal record itself exposes no destructive controls.

Mobile checks preserve the same hierarchy: branding inputs and logo upload remain readable, and subordinate administrator controls wrap without clipping or overlap. The principal remains protected from those actions in the mobile presentation.

The live published `/admin/tours` route correctly completed its loading state by redirecting an unauthenticated browser session to `/admin/login`. This confirms the protected-route guard; authenticated mutation testing remains intentionally pending until an approved administrator signs in to the live browser session.

Standalone Vercel diagnostic, 17 August 2026: `https://triphimalaya.vercel.app/api/health` returns the expected service JSON, while the public `tours.list` tRPC procedure produces Vercel `FUNCTION_INVOCATION_FAILED` (HTTP 500). The browser client and rewrite are therefore reaching the serverless API; the failing function must be corrected through the Vercel runtime logs and its database/runtime environment configuration before public tour data can load.

Vercel dashboard evidence, 17 August 2026: project `triphimalaya` is deployed from `Mainul-21/trip-himalaya`, branch `main`, commit `0a733c7`, and reports a 95.7% function error rate. The healthy `/api/health` route together with the failed tRPC queries confirms a data-procedure/runtime configuration problem rather than a static-site build failure.

Vercel Runtime Logs identify the direct cause: production tRPC calls fail because `api/index.js` imports `/var/task/server/_core/index`, which is absent from the serverless function bundle (`ERR_MODULE_NOT_FOUND`). The health route succeeds because it does not load that server module. This must be fixed by changing the API entrypoint/bundling configuration and redeploying; database environment variables cannot resolve this module-resolution failure by themselves.

Vercel’s current function guidance explains that runtime dependencies are discovered by static import tracing and that files unavailable to the trace must be explicitly included. It also confirms that Node.js server entrypoints can be deployed from a root `server.{js,ts}` file and that Express can be routed through a serverless function. Sources: https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions, https://vercel.com/docs/functions/runtimes/node-js, and https://vercel.com/kb/guide/using-express-with-vercel (accessed 17 August 2026).

The Vercel repair isolates the Express API factory from Vite-only development code and compiles it as a self-contained CommonJS bundle during `pnpm vercel:build`. Both Vercel API entrypoints load that generated bundle, and `vercel.json` explicitly includes it in the functions. The full 75-test suite, TypeScript check, standard production build, Vercel build, and an executable bundle smoke test passed. The remaining requirement is to deploy the generated-source change to Vercel and confirm the live `tours.list` response.

An immediate post-publish browser check could not retain the external Vercel response and returned to a blank browser state. It is therefore not evidence of either success or failure; live verification remains pending the Vercel deployment completing.

The subsequent Vercel-project check was redirected to the Vercel login screen because the browser session had expired. Live deployment status and API verification therefore require the user to authenticate again before they can be conclusively checked.

The legacy optimized tour image endpoint at `https://himalayatrip-ahqqbylp.manus.space/manus-storage/triund-trek-card_ca8a30e8.webp` was verified as publicly reachable. It redirects to a current signed CloudFront image URL and renders the existing image. Vercel fails because `/manus-storage/...` is a relative path that resolves to the Vercel domain; a resolver can safely send existing legacy paths to the verified managed-site origin while leaving administrator-uploaded absolute URLs unchanged.

The legacy media resolver now routes existing tour variants, homepage imagery, review portraits, and agency branding through that stable public origin. Regression, TypeScript, standard production build, and Vercel bundle build validation passed. Local desktop QA confirms that the homepage hero and official logo render from the stable managed-media origin; live Vercel card and carousel confirmation remains pending the deployment of this source update.

Live Vercel verification confirms that the tour API now loads all four public journeys and their controls. However, tour-card image elements still resolve to host-relative `/manus-storage/...` URLs and display broken-image placeholders on the Vercel catalogue. This means the live static client is either still serving the previous bundle or at least one public card/carousel rendering path is bypassing the resolver. The image repair remains in progress; no live image-delivery success has been claimed.

The reference-led homepage presentation was checked at desktop and 390 px mobile widths. It retains fixed public navigation, existing journey data, genuine administrator-managed review rendering, clear search-to-catalogue navigation, accessible enquiry controls, the public footer, and the WhatsApp action. The design now uses the supplied reference’s structural rhythm: image-led hero, compact trust strip, travel-style cards, journey cards, five-value grid, traveller-stories area, practical enquiry panel, and content-rich footer. No fictional statistics, review counts, ratings, testimonials, or tours were introduced.

Post-deployment Vercel verification confirms that the public catalogue recovers from its brief loading state and renders all three currently published journeys with live image elements. The visible image URLs resolve to the stable `https://himalayatrip-ahqqbylp.manus.space/manus-storage/...` origin rather than host-relative Vercel `/manus-storage/...` paths, and the desktop visual check shows working tour-card images, carousel controls, brand logo, and public footer media.

The development-preview follow-up found no source-level media failure. The optimized hero and card paths are normalized through the stable public legacy-media origin; representative requests followed the expected redirect and returned final `200` image responses. No additional resolver change was needed.

A subsequent fully loaded desktop check and a 390 px mobile check confirm that the homepage hero, official logo, travel-style tiles, journey-card media, value icons, and footer branding render visibly. The earlier blank capture was transient while remote managed-media assets were resolving; no implementation change was required.

## Homepage reference alignment — 20 August 2026

The homepage was rebuilt to follow the supplied visual hierarchy without changing its public routes, editable agency profile, live tour selection, protected administration area, or contact handling. Desktop and 390 px mobile checks confirm the image-led hero, compact trust strip, six travel-style tiles, published journey cards, five-point planning rationale, published-review display, enquiry panel, and existing footer remain readable and responsive. The enquiry panel now presents optional travel date, group-size, and destination fields alongside the existing required contact and trip-detail fields; their values are consolidated into the existing enquiry message, so no database-schema change was required. Only published reviews are rendered, and no statistics, ratings, review count, tours, or testimonials were fabricated.

## Supplied homepage source adaptation — 20 August 2026

The supplied homepage archive was treated as an untrusted design reference and its static Himalayan imagery was moved to managed web storage before use. Its hero image is now the first responsive slide, and its six category images are used only as visual defaults for the existing legacy styles. Administrator-uploaded travel-style images remain authoritative and are never replaced. Existing live tours, published reviews, enquiry submission, tour detail links, category filtering, telephone, WhatsApp, and navigation routes remain bound to their existing application data and actions. The adapted page passed all 78 automated tests, TypeScript validation, and a 390 px mobile visual check.

An initial external published-site check displayed the branded loader while the page was still preparing. This single in-progress state is not treated as success or failure; a follow-up check is required before declaring external visual verification complete.

During the follow-up, the published origin remained on the branded loader and reported an older main asset (`index-BIuWTWCZ.js`) rather than the current local production build asset. No client-side console error was emitted, and the on-page response therefore indicates delayed or stale external static delivery rather than a confirmed defect in the checked-in homepage source. A fresh external deployment/cache check remains pending.

## Exact replica homepage integration — 20 August 2026

The newly supplied exact-replica builder was used as the primary visual blueprint. The desktop and 390 px mobile checks confirm the supplied mountain hero, compact trust bar, six photographic category tiles, compact journey-card treatment, planning rationale, verified review area, enquiry strip, and footer remain responsive. The public `/tours` route confirms that category filters, multi-photo carousel controls, detail links, WhatsApp enquiry links, telephone action, and managed-media delivery remain available. The homepage continues to render only published tours and published administrator-managed reviews; administrator-uploaded agency and travel-style data remains authoritative. The implementation passed all 78 automated tests, TypeScript validation, and a production build.

A fresh cache-busted check of the managed published origin now completes successfully and shows the exact-replica homepage rather than its temporary loader or a stale bundle. The live document exposes the fixed navigation, search, planning and explore calls to action, three-slide hero controls, six category filter links, published journey actions, enquiry form, WhatsApp and phone controls, and managed-media URLs. This resolves the earlier external delivery observation for the managed deployment.

## Literal replica header verification — 20 August 2026

The supplied replica header treatment was checked on cache-busted desktop and 390 px mobile URLs. Query-string homepage URLs now retain the transparent hero header, omit the non-home search field, preserve the image-led hero, trust bar, responsive Plan Trip control, and mobile navigation trigger. The correction is covered by the public-layout regression test; all 79 automated tests and TypeScript validation pass.

A fresh managed-preview browser check for checkpoint `ee881e8c` completed after the brief branded loader. The public document exposes the exact-replica hero, top navigation, travel-style filters, hero controls, published journey actions, enquiry fields, WhatsApp, telephone, social links, and footer search. This confirms the current published preview serves the revised homepage rather than a stale bundle.

## Linked Lovable reference alignment — 20 August 2026

The shared Lovable preview’s protected document could not be opened directly without its owner session, but its supplied companion source and accessible share-preview structure were used as the literal layout blueprint. The updated Trip Himalaya homepage now follows that hierarchy at 1280 px and 390 px: transparent overlay header, full-width mountain hero, paired calls to action, side carousel controls, four-point trust strip, six image-forward experience tiles, compact package cards, planning rationale, published-review panel, compact enquiry form, and dense information footer. The page retains real published tours, administrator-managed profile and travel-style data, verified reviews only, filtering, navigation, enquiry submission, telephone, WhatsApp, and accessibility labels. The complete regression suite reports 79 passing tests; TypeScript validation and the production build also pass.

## Full public-site reference system — 20 August 2026

The same reference system now carries through every visitor-facing route: public catalogue, treks, tour detail, booking, About, Experiences, contact, and the interactive not-found page. Desktop and 390 px mobile checks confirm the shared header, compact navy page banners, package-grid framing, orange conversion actions, square form panels, mobile Plan Trip control, information footer, and responsive detail-page pricing/WhatsApp actions. The public tour-detail page maintains the live itinerary and gallery controls, while booking and contact preserve their existing submission contracts. The visible public site uses real published journeys and administrator-managed profile content; it does not seed or display fabricated customer content.

## Live Vercel confirmation — 20 August 2026

The cache-busted production URL `https://triphimalaya.vercel.app/?v=821ec6a0` completed its initial branded loader and mounted the public application rather than serving a blank page or source text. The live document exposes the reference-aligned header, hero controls, category links, real tour cards with details and WhatsApp actions, enquiry form, telephone, social links, and footer search. This confirms the connected Vercel deployment is currently serving the public site successfully.

## Enlarged replica interface and action review — 20 August 2026

Desktop and phone checks confirm the revised public text, Plan Trip button, mobile navigation trigger, carousel controls, package-card price/actions, enquiry controls, and footer links are now visibly larger and readable. On the live catalogue, the Best Sellers filter was exercised and reduced the listing to the published Kareri Lake Explorer record. The displayed tour card exposes its live detail route, prefilled WhatsApp enquiry URL, direct telephone action, carousel controls, and accessible photo selectors. The source assertions and regression suite now protect the approved larger readable control sizing.

## Final public action and readability verification — 20 August 2026

After the final scale correction, desktop and phone checks confirm larger readable public typography, expanded navigation and contact controls, larger carousel arrows, clearer journey-card metadata, pricing, and actions, and legible footer links. The public catalogue was exercised with the Best Sellers filter; it correctly reduced the live catalogue to the published best-selling journey. The visible public experience retains its tour-detail links, WhatsApp enquiry URLs with tour context, telephone action, enquiry form, footer search, navigation links, and responsive mobile controls. The final regression suite passes after these readability corrections, as do TypeScript validation and the production build.

The Kareri Lake Explorer detail route was opened from the live catalogue and completed its loader successfully. Its real gallery, previous/next photo controls, itinerary, FAQ summaries, booking route, direct telephone action, and tour-context WhatsApp message are visible and available after the final public scale correction.

The visible WhatsApp control was followed to the official WhatsApp destination for Trip Himalaya’s configured contact number, confirming that the public contact action resolves rather than failing. No message was sent and no user information was entered.

After a fresh route load, the live Kareri Lake Explorer detail page completed its journey loader and exposed the real photo controls, route return, booking, tour-specific WhatsApp, telephone, and footer actions. This establishes the responsive detail-page action set before exercising its gallery navigation.

## Literal supplied-source conversion — 20 August 2026

The supplied `exact-replica-builder` homepage source was re-read line by line and is now the direct visual contract for the public homepage. The public header has been moved into the homepage hero exactly as in the supplied source; its hero overlay, navigation dimensions, two CTA controls, slideshow controls, four-point trust bar, six visual categories, compact four-package pattern, rationale card, traveller-story panel, enquiry strip, dense footer, and floating actions now use the supplied component hierarchy and utility patterns.

A 1280 px full-page preview verifies that Tailwind utilities and the reference token system are applied in the running app, including the Oswald display headings, navy/orange palette, source card sizes, compact footer, and hero-overlay header. The first visual capture exposed a missing Tailwind entry import in the global stylesheet; it was restored immediately, after which the reference styling rendered correctly. This was a stylesheet-loading correction only, not an independent visual redesign.

The live substitutions remain deliberately limited. Package cards pull real published Trip Himalaya records from the public catalogue, and the six category labels and photographs are fixed to the exact supplied source values. Traveller Stories renders only actual administrator-published reviews: because the live dataset currently contains fewer than the reference's three static review examples, no fictional review, rating, count, person, or quote has been added. Footer journey lists also remain bounded by genuinely published tours. The administrator-only header link appears only in an authenticated session, as required by the protected portal workflow.

The 390 px mobile full-page verification confirms that the source hierarchy collapses cleanly without clipped text or overlapping controls: the compact logo/header and menu control remain visible; the reference hero, paired CTAs, trust bar, two-column category tiles, single-column package cards, Traveller Stories panel, enquiry form, and dense footer retain their intended order and readable scale. Final validation passes TypeScript, all 76 automated tests, the standard production build, and the Vercel-specific build. The only build observation is Vite’s existing advisory that the main JavaScript bundle is larger than 500 kB; it does not prevent the build or change the source-faithful layout.

## Three-dots mobile navigation repair — 20 August 2026

The public navigation trigger now uses an explicit vertical three-dots control, with a larger 44 px touch target. It remains visible until the full `lg` desktop-navigation breakpoint instead of disappearing at the earlier `md` breakpoint. A 390 px phone viewport verifies the visible three-dots control beside the Trip Himalaya brand, and a 980 px viewport—representative of a phone browser’s desktop-mode CSS width—also retains the visible three-dots trigger alongside the Plan Your Trip action. The drawer uses the same breakpoint, so it stays available whenever the trigger is visible. TypeScript and the complete 76-test suite pass, including the updated navigation regression.

## Mobile drawer layering and enquiry Date guidance — 20 August 2026

The shared header now creates an isolated `z-50` layer and the expanded mobile drawer uses its own `z-50` stacking layer with a safe viewport height and scroll fallback. Navigation links and the planning action use a minimum 44 px height and explicit line-height, preventing labels from colliding when the three-dots control is opened. The 390 px homepage capture confirms the final enquiry field visibly starts as **Date**, while the 980 px desktop-mode capture confirms the three-dots trigger and Plan Your Trip control remain visible together. Source-level regression checks protect the layer, link-height, and Date-field contracts; TypeScript and all 76 tests pass.

## Professional mobile menu control and header spacing — 20 August 2026

The vertical three-dots glyph has been replaced with a conventional, high-contrast hamburger menu control. At the 390 px phone viewport, the brand and hamburger remain clearly separated and readable; at the 980 px phone desktop-mode viewport, **Plan Your Trip** and the hamburger are aligned in one compact right-side group, eliminating the earlier large empty space between them. The focused navigation regression and TypeScript validation pass.

## Source-reference category media repair — 20 August 2026

The two previously empty experience tiles—**Village Experiences** and **Himachal Tours**—now reference newly uploaded stable managed image paths from the supplied category-media set. The six-card mapping remains unchanged in title, order, route, dimensions, and source-reference layout; only the two failed image paths were replaced. Desktop and 390 px phone captures confirm the reference homepage remains responsive after the repair, while TypeScript and the focused homepage presentation regression pass.

## Complete category-image loading verification — 20 August 2026

The initial path refresh exposed that four legacy category assets could still display blank on a first page render despite returning network responses. All six supplied category photographs were therefore re-uploaded as fresh managed web assets and their source-reference mappings were updated without altering labels, links, card dimensions, or layout. Full-page 1280 px desktop and 390 px phone captures now visibly show **Trekking**, **Spiritual Tours**, **Camping**, **Village Experiences**, **Himachal Tours**, and **Custom Tours** with their correct mountain-travel imagery. TypeScript and the focused homepage media regression pass; no generated imagery or substitute card design was used.
