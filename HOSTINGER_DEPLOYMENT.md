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
3. Enter the build and entry settings shown above, then add the required environment variables.
4. Deploy. For server-side Node apps, Hostinger creates the public routing bridge automatically; do not replace its generated `public_html/.htaccess` with unrelated rules.
5. Test `/`, `/admin`, `/admin/login`, `/tours`, and `/api/trpc` from the deployed domain.

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

The public page files and React route definitions are unchanged by this configuration.
