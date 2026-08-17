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
