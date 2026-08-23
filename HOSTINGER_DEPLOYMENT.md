# Hostinger Production Deployment: Trip Himalaya

> **Use Hostinger Node.js Web App deployment for a working administrator portal.**
> Uploading only `dist/public` is sufficient for public page rendering, but not for authenticated admin actions, database data, enquiries, bookings, or image uploads. The admin portal calls the same-site `/api/trpc` Node/Express API.

## Why `/admin` showed an invalid page

Trip Himalaya uses client-side routes. A direct request to `/admin` must be served with the React `index.html` entry point; then the React router opens the administrator screen. Static Apache hosting returns an invalid or 404 page unless it has an SPA rewrite rule.

The project now ships `client/public/.htaccess`. The production build copies it to `dist/public/.htaccess`; it preserves real files and `/api/*` requests, then rewrites public client-side routes such as `/admin`, `/admin/login`, `/tours`, and `/about` to `index.html`.

## Recommended option: full Node.js deployment

This is the required option if the administrator portal must actually sign in, load data, save edits, process enquiries/bookings, or upload images.

| Hostinger hPanel setting | Use this value |
|---|---|
| App type | **Node.js Web App**; select **Express.js** if detected, otherwise **Other** |
| Node version | **22.x** |
| Repository | `Mainul-21/triphimalaya02`, branch `main` |
| Package manager | **pnpm 11.22.0** |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `npm run build` |
| Start command | `npm start` |
| Output directory | `dist` |
| Entry file | `dist/index.js` |
| Runtime environment | `NODE_ENV=production` |

### Required hPanel environment variables

Create the variables listed in [`HOSTINGER_ENV.example`](./HOSTINGER_ENV.example) in **hPanel → Website → Environment Variables**. Use your own secret values—never upload a real `.env` file to GitHub or the public web root.

`DATABASE_URL`, `JWT_SECRET`, and `INITIAL_ADMIN_SETUP_KEY` are required for the server and approved admin account workflow. For TiDB Cloud public endpoints, set `DATABASE_SSL=true`; the application also auto-enables TLS when the database URL uses port `4000`. If TiDB Cloud Dedicated supplies a CA certificate, set `DATABASE_SSL_CA_PATH` to the deployed certificate path and keep `DATABASE_SSL_REJECT_UNAUTHORIZED=true`. `CLOUDINARY_URL` is required for administrator image uploads outside the managed development platform. This project’s server listens on the `PORT` provided by Hostinger; do not force a fixed public port.

### Deploy steps

1. In hPanel, open **Websites → Add Website → Deploy Web App** and choose the Node.js app flow. [Hostinger’s current Node.js guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) confirms Node apps are supported on Business and Cloud plans.
2. Import the GitHub repository or upload the complete project ZIP. Do **not** upload only the old Vite `dist/public` folder for this full-stack option.
3. If hPanel has a package-manager selector, choose **pnpm 11.22.0**. The repository’s canonical lockfile is `pnpm-lock.yaml`, `package.json` pins the managed pnpm version, and `pnpm-workspace.yaml` scopes native build approvals for esbuild and Tailwind. Do not mix npm and pnpm lockfiles or enable an unrelated Corepack override.
4. Enter the build and entry settings shown above, then add the required environment variables. Do not paste a local `.env` file into the public web root.
5. Apply the existing Drizzle migrations to the configured database using a controlled migration step. Do not use `pnpm db:push` or any destructive reset against an existing production database; first confirm the target database and take a backup.
6. Deploy. For server-side Node apps, Hostinger creates the public routing bridge automatically; do not replace its generated `public_html/.htaccess` with unrelated rules.
7. Test `/`, `/admin`, `/admin/login`, `/tours`, `/api/health`, and `/api/trpc` from the deployed domain.

### If a page says “Failed to fetch dynamically imported module”

> This error means the browser has been given a JavaScript route file name such as `Tours-xxxx.js`, but that exact file is not available from the live Hostinger `assets/` directory. It is a **partial deployment or CDN-cache mismatch**. Do **not** run `pnpm db:push`, change the database, or delete tour/admin data for this error.

Follow these steps in order:

1. In hPanel, open **Websites → triphimalya.com → Deployments**. Confirm the selected GitHub branch is `main` and trigger **Settings and redeploy** (or **Redeploy**) from the current deployment. Wait for a successful build; do not interrupt it.
2. Keep the Node.js configuration in the table above. Hostinger must build and deploy the **entire current project**, then start `dist/index.js`; do not upload a single JavaScript chunk or mix files from different builds.
3. If Hostinger CDN/cache is enabled, use its **Clear cache** or **Purge cache** control after the new deployment becomes active. The exact label may differ by hPanel plan. Do not manually delete live files unless Hostinger provides a backup or clean-redeploy flow.
4. Open a new incognito/private browser window and check `/`, `/tours`, and `/admin/login`. This avoids a browser tab using the previous build’s asset references.
5. If the same route error appears after **two complete successful redeployments**, open a Hostinger support request. Include only the affected URL and missing asset path, for example `/assets/Tours-xxxx.js`; do not share database URLs, passwords, API keys, or session data.

For the static-only fallback, upload the **complete contents** of one `dist/public` build—including `index.html`, `.htaccess`, and every file under `assets/`—in one deployment operation. A static-only upload still cannot power the protected administrator API, so the full Node.js deployment remains the correct production option.

### pnpm clean-install policy

The repository uses one package-management contract: **pnpm 11.22.0**, the root `pnpm-lock.yaml`, and the committed `pnpm-workspace.yaml`. A frozen pnpm install was validated with the full test suite, TypeScript compilation, and the production build. The workspace explicitly permits the native binaries required by esbuild and Tailwind; do not replace this with an ad-hoc install or runtime permission workaround.

Hostinger builds while `NODE_ENV=production` is set. Ensure the managed pnpm install includes the development toolchain required by `vite`, TypeScript, Vitest, and `esbuild`; the committed workspace policy permits the required native build packages. Use the normal `pnpm install --frozen-lockfile` and `pnpm run build` commands, and do not replace the build with `npx vite` or remove the native-build policy.

Use the normal `pnpm install --frozen-lockfile` and `pnpm run build` commands. Do **not** add `ignore-scripts`, runtime `chmod`, `sudo`, or generated package-manager workarounds. The build still requires trusted package lifecycle scripts to install native binaries.

### If Hostinger’s pnpm install reports `spawnSync .../esbuild/bin/esbuild EACCES`

First confirm that hPanel is using **pnpm 11.22.0**, Node **22.x**, root **`./`**, and the latest `main` branch with `pnpm-lock.yaml`. Then click **Save and redeploy** to recreate the managed build workspace.

If the same `EACCES` error remains during `pnpm install --frozen-lockfile`, it is a Hostinger deployment-workspace restriction: the package manager cannot repair an executable blocked by the managed filesystem while installation is in progress. Send the sanitized final log lines to Hostinger support and ask them to recreate the Web App build workspace and verify that its deployment user can execute package binaries under `node_modules`.

## Static-only fallback (visual route repair only)

Use this only if the Node/API server is already hosted separately under the same domain. Run:

```bash
npm ci
npm run build
```

Upload the **contents** of `dist/public`—including the hidden `.htaccess` file—to `public_html`, not the `dist/public` directory itself. In hPanel File Manager, enable hidden-file visibility and confirm `public_html/.htaccess` contains the project’s SPA fallback rule.

This corrects the direct `/admin` invalid-page route. It does **not** create the `/api/trpc` backend that the admin portal needs. If the API is absent, use the recommended Node.js deployment instead of uploading only static files.

## Post-deployment checks

| URL or action | Expected result |
|---|---|
| `/` | Existing public homepage renders unchanged |
| `/admin` | Trip Himalaya administrator login or active authenticated portal appears—not a Hostinger invalid page |
| `/admin/login` | Direct refresh remains on the administrator sign-in screen |
| `/tours` and `/about` | Client-side public routes load after a hard refresh |
| Admin sign-in | `/api/trpc` returns API responses, not an HTML invalid-page document |
| Admin image upload | Works after `CLOUDINARY_URL` is configured |

## If the issue remains

1. Confirm Hostinger deployed the **full Node project**, not only a frontend ZIP.
2. Open the latest hPanel deployment logs and confirm `npm run build` completed.
3. Confirm `dist/index.js` exists in the Node build output and `NODE_ENV=production` is set.
4. Confirm `DATABASE_URL` points to the intended TiDB database, `DATABASE_SSL=true` is set for TiDB Cloud public endpoints, and the optional CA path is readable when used; then redeploy or restart the Node application.
5. Confirm the database has all migrations through `0013_lovely_thunderball.sql` applied before diagnosing application queries.
6. If using static-only upload, confirm the hidden `.htaccess` is in `public_html` and no conflicting older rewrite file replaced it.
7. If the log reports a pnpm lockfile or optional-dependency resolution error, confirm the deployed source includes the committed root `pnpm-lock.yaml` and `pnpm-workspace.yaml`; then start a fresh deployment from the latest `main` branch.
8. If the log reports `spawnSync .../esbuild/bin/esbuild EACCES` during `pnpm install --frozen-lockfile`, do not disable scripts or add a runtime `chmod` workaround. Ask Hostinger to reset the Web App build workspace and ensure the deployment filesystem permits binary execution.

The public page files and React route definitions are unchanged by this configuration.
