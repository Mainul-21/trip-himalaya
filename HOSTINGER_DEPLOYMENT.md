# Trip Himalaya: Hostinger Next.js Deployment

Trip Himalaya is now a **Next.js 16 App Router** application. It serves the public travel site, the protected administrator portal, and the tRPC database API from one Node.js process. Do not deploy it as a Vite static site, an Express entry file, or a manually uploaded `dist` folder.

## Required Hostinger Web App settings

In **Hostinger hPanel → Websites → triphimalya.com → Deployments → Settings and redeploy**, use the following values.

| Setting | Required value |
|---|---|
| Framework preset | **Next.js** |
| Branch | `main` |
| Node.js version | **22.x** |
| Root directory | `./` |
| Package manager | **npm** |
| Build command | `npm run build` |
| Start command | `npm start` |
| Output directory | Leave empty; Next.js manages `.next` itself |
| Entry file | Leave empty; Next.js manages its own Node entry point |

> Do not select **Vite**, **Express**, or **Other** after this migration. Those presets do not provide the correct Next.js production runtime.

## Environment variables

In **Environment variables**, add the existing production values. Do not place these values in GitHub, screenshots, or public files.

| Key | Required |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Yes |
| `JWT_SECRET` | Yes |
| `CLOUDINARY_URL` | Yes, for image uploads |

The committed `.npmrc` keeps the development build toolchain available during Hostinger’s production install. Do not add `npm audit fix --force`, `ignore-scripts`, `unsafe-perm`, `chmod`, or manual `node_modules` uploads.

## Deployment sequence

1. Confirm the latest `main` commit includes `package-lock.json`, the `app/` directory, and `next.config.mjs`.
2. Save the settings above and select **Save and redeploy**.
3. The build log must contain `next build` and finish successfully.
4. Wait until the deployment status is **Live**.
5. Test the public homepage, `/tours`, `/admin/login`, and `/api/trpc/tours.list?input={}`.

## Handling a 403 response

A Hostinger-branded `403 Forbidden` page occurs before Next.js receives the request. It does not mean that tours, administrator accounts, or database records were deleted.

1. Confirm the newest deployment is **Live**, not merely built.
2. Restart the Web App from hPanel, then retest the root domain.
3. If 403 persists, ask Hostinger support to **recreate the domain-to-Node-Web-App routing bridge** for `triphimalya.com`. Do not upload a custom `.htaccess` file or change the site to static hosting.

## Security action required

The previous database, JWT, and Cloudinary credentials were exposed in screenshots. Rotate all three credentials and update their replacement values in Hostinger before final launch.
