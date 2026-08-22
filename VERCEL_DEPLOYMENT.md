# Vercel deployment guide

## Current production choice: Vercel for `triphimalya.com`

Trip Himalaya is deployed on **Vercel**. Hostinger may remain only as the domain registrar or DNS manager; do **not** deploy this application to Hostinger or point the website records to a Hostinger web-app IP.

In **Vercel → Project → Settings → Domains**, add both `triphimalya.com` and `www.triphimalya.com`. Make `triphimalya.com` the primary domain and redirect `www` to it. Then, at the current DNS provider (for example, **Hostinger hPanel → Domains → DNS Zone Editor**), set the apex `@` record to the **A-record value displayed by Vercel** and set the `www` CNAME to the **exact Vercel CNAME target**. Remove only conflicting old `@` and `www` website records; keep MX, TXT, and other email records.

In **Vercel → Project → Settings → Environment Variables**, add `DATABASE_URL`, `JWT_SECRET`, and `CLOUDINARY_URL` for Production. Their values were exposed in earlier screenshots, so first rotate the TiDB password, generate a new random JWT secret, and regenerate the Cloudinary credential. Redeploy after saving the variables because environment-variable changes apply to the next deployment. [Vercel’s environment-variable guide](https://vercel.com/kb/guide/how-to-add-vercel-environment-variables) and [domain guide](https://vercel.com/docs/domains/working-with-domains/add-a-domain) explain those dashboard flows.

After Vercel marks the domain as valid, open `https://triphimalya.com/api/health`. It should return JSON containing `"ok": true` and `"service": "trip-himalaya-api"`. Then test the homepage, `https://triphimalya.com/admin/login`, and `https://www.triphimalya.com` (which should redirect to the primary domain).

## Blank-page repair

The repository now uses a Vercel-safe Vite build and an SPA fallback that **does not intercept `/api/*`**. This matters because the public site loads its journeys and forms through the API function. The project also includes a lightweight deployment check at `/api/health`.

Before redeploying, open **Vercel → Project Settings → General** and confirm that **Root Directory** is the repository root (`.`), not `client`. A `client` root directory bypasses the repository’s Vercel configuration and can serve an incomplete or blank app.

After the new deployment is ready, open `https://YOUR-VERCEL-DOMAIN/api/health`. It should return:

```json
{"ok":true,"service":"trip-himalaya-api"}
```

Then open the root domain in an incognito window. If the health URL works but the root is still blank, save a screenshot of the Vercel **Build Logs** and the browser console; this separates a deployment routing issue from a browser asset-loading issue.

> The routing pattern follows Vercel’s official rewrite guidance: [Vite SPA deployment](https://vercel.com/docs/frameworks/frontend/vite) and [rewrite patterns](https://vercel.com/docs/routing/rewrites).

The repository now includes `vercel.json`, which makes Vercel build the Vite application into `dist/public`, serves that built output, and keeps React deep links working. The native `api/index.ts` and `api/[...path].ts` Vercel Functions send the root and nested `/api/*` requests to the exported Express application without changing their request paths.

## Vercel project settings

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root directory | Repository root |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm vercel:build` |
| Output directory | `dist/public` |
| Node.js version | 22.x |

Do not configure Vercel to deploy the repository root as a static directory. That causes the source files or a directory listing to be served instead of the generated application.

For a Windows-local setup or an npm alternative, see [`WINDOWS_SETUP.md`](./WINDOWS_SETUP.md). The obsolete Vite helper that caused an npm peer-dependency conflict has been removed; after pulling the latest `main` branch, a standard `npm install` can resolve the project without `--force` or `--legacy-peer-deps`.

## Required environment variables

The public interface can build without secrets, but its live tours, booking, enquiry, administrator, and image-upload features need the following owner-controlled values in **Vercel → Project Settings → Environment Variables**. Add each value for **Production**, **Preview**, and **Development**; never commit real values to the repository.

| Variable | Purpose | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Connects the MySQL-compatible database | Create and manage this database outside Vercel. |
| `JWT_SECRET` | Signs the credential-only administrator session | Use a private, random value of at least 32 bytes. |
| `CLOUDINARY_URL` | Uploads administrator-selected images | Copy Cloudinary's full `cloudinary://…` API Environment Variable. |

The live administrator sign-in is **email and password only**; it does not require Google, social, Manus, or other OAuth credentials. Do not add invented `BUILT_IN_FORGE_*` values on Vercel: those managed-platform values are unavailable outside the managed environment. The Cloudinary fallback handles image uploads for local and Vercel deployments instead.

## Redeploy

After the repository is pushed, open the Vercel deployment and select **Redeploy**. Confirm the build uses the settings above, then check `/api/health` before testing the homepage and `/admin/login`. The deployment should show the Trip Himalaya website rather than raw project text.
