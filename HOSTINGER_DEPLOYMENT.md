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
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` |
| Output directory | `dist` |
| Entry file | `dist/index.js` |
| Runtime environment | `NODE_ENV=production` |

### Required hPanel environment variables

Create the variables listed in [`HOSTINGER_ENV.example`](./HOSTINGER_ENV.example) in **hPanel → Website → Environment Variables**. Use your own secret values—never upload a real `.env` file to GitHub or the public web root.

`DATABASE_URL`, `JWT_SECRET`, and `INITIAL_ADMIN_SETUP_KEY` are required for the server and approved admin account workflow. `CLOUDINARY_URL` is required for administrator image uploads outside the managed development platform. This project’s server listens on the `PORT` provided by Hostinger; do not force a fixed public port.

### Deploy steps

1. In hPanel, open **Websites → Add Website → Deploy Web App** and choose the Node.js app flow. [Hostinger’s current Node.js guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/) confirms Node apps are supported on Business and Cloud plans.
2. Import the GitHub repository or upload the complete project ZIP. Do **not** upload only the old Vite `dist/public` folder for this full-stack option.
3. The project is pinned to **pnpm 11.22.0** to match Hostinger’s current runtime. If hPanel has a package-manager selector, choose **pnpm**; do not enable a separate Corepack override or use pnpm 10.
4. Enter the build and entry settings shown above, then add the required environment variables.
5. Deploy. For server-side Node apps, Hostinger creates the public routing bridge automatically; do not replace its generated `public_html/.htaccess` with unrelated rules.
6. Test `/`, `/admin`, `/admin/login`, `/tours`, and `/api/trpc` from the deployed domain.

### pnpm 11 native-build policy

The repository includes `pnpm-workspace.yaml`, which permits only the two native dependencies required by this production build: `@tailwindcss/oxide` and `esbuild`. Keep this file at the repository root when deploying from GitHub or a full-project ZIP.

Do **not** run `pnpm approve-builds` in Hostinger, add a broad `allow-scripts=true` setting, or use the obsolete `.npmrc` key `build-dependencies-for`. Those alternatives either do not apply to pnpm 11 or weaken the project’s dependency-script controls. With the committed workspace policy present, use the normal **Install command** and **Build command** in the settings table above.

### If Hostinger’s pnpm install reports `spawnSync .../esbuild/bin/esbuild EACCES`

This error occurs during dependency installation, before the application `build` script starts. It means the deployment environment has not preserved esbuild’s executable permission when packages were hard-linked from pnpm’s store.

The repository now sets `packageImportMethod: copy` in the root `pnpm-workspace.yaml`. This makes pnpm copy package files into its virtual store instead of hard-linking them, while retaining the existing scoped approvals for only `@tailwindcss/oxide` and `esbuild`.

1. Keep **Package manager** as `pnpm`, Node as **22.x**, and Entry file as **`dist/index.js`**.
2. Confirm the GitHub deployment uses the latest `main` branch, which includes the updated `pnpm-workspace.yaml` and regenerated `pnpm-lock.yaml`.
3. Click **Save and redeploy** so Hostinger performs a clean installation with the copy-import policy.
4. Do **not** add `ignore-scripts=true`, `allow-scripts=true`, `chmod` commands, `sudo` commands, or an npm fallback. These do not address the hard-link permission cause and can introduce new native-dependency installation issues.

The copy-import policy was validated from a clean pnpm 11.22.0 installation: esbuild retained mode `755`, executed successfully, and the production build, TypeScript check, and full test suite passed.

## Static-only fallback (visual route repair only)

Use this only if the Node/API server is already hosted separately under the same domain. Run:

```bash
pnpm install --frozen-lockfile
pnpm build
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
2. Open the latest hPanel deployment logs and confirm `pnpm build` completed.
3. Confirm `dist/index.js` exists in the Node build output and `NODE_ENV=production` is set.
4. Confirm all required environment variable names and values are set in hPanel, then redeploy or restart the Node application.
5. If using static-only upload, confirm the hidden `.htaccess` is in `public_html` and no conflicting older rewrite file replaced it.
6. If the log still reports `ERR_PNPM_IGNORED_BUILDS`, confirm the deployed source includes the root-level `pnpm-workspace.yaml` file and that the app is using pnpm 11.22.0; then start a fresh deployment from the `main` branch.
7. If the log reports `spawnSync .../esbuild/bin/esbuild EACCES`, confirm the deployed branch contains the current root `pnpm-workspace.yaml` with `packageImportMethod: copy`, then trigger a fresh deployment. Do not disable scripts or add a runtime `chmod` workaround.

The public page files and React route definitions are unchanged by this configuration.
