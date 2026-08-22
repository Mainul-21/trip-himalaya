# Hostinger 403 Incident Record

## Observation

On **22 August 2026**, a direct request to `https://triphimalya.com/` returned the Hostinger-style response **`403 Forbidden — Access to this resource on the server is denied!`**.

## Scope

The response is generated before the Trip Himalaya React/Express application content is served. It therefore indicates a Hostinger domain-to-Web-App attachment, deployment activation, or document-root/routing issue rather than a Vite client bundle or `/admin` route error.

## Next evidence required

Inspect the active Hostinger deployment status and the domain assignment in hPanel. The current Node Web App deployment must be successful and explicitly attached to `triphimalya.com` (and `www.triphimalya.com` if desired); the domain must not simultaneously be served by an empty or restricted `public_html` document root.
