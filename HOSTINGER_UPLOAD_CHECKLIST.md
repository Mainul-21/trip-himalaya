# Trip Himalaya: Full Hostinger Upload Plan

This checklist deploys the **existing public website and working administrator portal** to Hostinger without changing the public pages. Follow the **Node.js Web App** route, not a static-only upload. The admin portal needs the same Node/Express API that serves `/api/trpc` for sign-in, tours, enquiries, bookings, and saved settings.

> **Important:** A `public_html` upload of only the frontend can make `/admin` open as a page, but it cannot make administrator sign-in, database data, or image upload work. For a fully working admin portal, Hostinger must show a **Node.js Web App** or **Deploy Web App** option in hPanel. [1]

## 1. Confirm the correct Hostinger hosting type

| What you see in hPanel | What to do |
|---|---|
| **Node.js Web App** or **Deploy Web App** | Continue with this checklist. This is the correct full-stack option. |
| Only File Manager and `public_html` | Do **not** use static-only deployment for the working admin portal. Move the site to a Hostinger plan with Node.js Web Apps, or host the API separately. |
| An old `/admin` “Invalid Page” error | The included SPA fallback addresses the route, but the Node server is still required for actual admin data and sign-in. |

## 2. Keep the latest code in GitHub

The recommended approach is connecting Hostinger directly to the private GitHub repository **`Mainul-21/triphimalaya02`**, branch **`main`**. Before deployment, make sure the current project changes are committed and pushed to that branch. Do not upload your local `.env` file to GitHub.

If you upload manually, upload the **whole project source**—including `client`, `server`, `drizzle`, `package.json`, `package-lock.json`, `.htaccess` source, and the deployment documents. Do not upload only an older `dist/public` folder for the Node deployment.

## 3. Create the Node.js Web App in Hostinger

Open **hPanel → Websites → Add Website → Deploy Web App**, then choose the Node.js flow. Connect your GitHub repository when prompted. Hostinger documents Node app deployment for eligible plans. [1]

Use these settings exactly:

| Hostinger setting | Value |
|---|---|
| Repository | `Mainul-21/triphimalaya02` |
| Branch | `main` |
| Application type | **Node.js Web App**; choose Express.js if Hostinger recognises it, otherwise Other |
| Node version | **22.x** |
| Package manager | **npm 10.x** |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm start` |
| Entry file, if hPanel asks for one instead of a start command | `dist/index.js` |
| Runtime environment | `NODE_ENV=production` |

The production build creates both `dist/index.js` (the Express server) and `dist/public` (the React frontend). The project uses the committed Linux-generated `package-lock.json` and declares **npm 10.9.2**. Do not enable a Corepack override or choose pnpm. The server uses Hostinger’s assigned `PORT`; do not force a custom public port.

## 4. Add environment variables before the first deploy

In **hPanel → Website → Environment Variables**, add these values using the real values from your existing local `.env` or Vercel environment settings. Do not paste secret values in GitHub, chat screenshots, or files inside `public_html`.

| Variable | Required? | Purpose |
|---|---:|---|
| `NODE_ENV` | Yes | Set to `production`. |
| `DATABASE_URL` | Yes | Your TiDB/MySQL connection string. |
| `JWT_SECRET` | Yes | Secure administrator session signing. Use a new long random value if you do not already have a valid production value. |
| `INITIAL_ADMIN_SETUP_KEY` | Yes | One-time principal-admin setup protection. Keep it private. |
| `CLOUDINARY_URL` | Yes for admin image uploads | Stores administrator-uploaded tour, hotel, review, and logo images outside the managed development platform. |
| `PORT` | Usually no | Hostinger normally supplies it. Only set it if hPanel specifically requires one. |

Use [`HOSTINGER_ENV.example`](./HOSTINGER_ENV.example) as the **name-only template**. It contains no real secrets.

## 5. Deploy and wait for a successful build

Start the deployment from hPanel. Wait until the build log confirms that `npm ci`, `npm run build`, and `npm start` all complete. If the build fails, do not change public page files; first copy the relevant Hostinger build-log error and share it for diagnosis.

> The project intentionally uses `npm start`, which runs `dist/index.js` in production. Do not use `npm run dev`, `vite preview`, or a fixed port for Hostinger production.

## 6. Direct-route protection for `/admin`

The project includes a client-side routing fallback at `client/public/.htaccess`, copied during build to `dist/public/.htaccess`. It keeps real static files and `/api/*` requests untouched while sending client-side routes such as `/admin`, `/admin/login`, `/tours`, and `/about` to the React entry page.

For a Node.js Web App, do not overwrite any Hostinger-generated web-server bridge files. If Hostinger asks for static files separately, ensure the built `dist/public/.htaccess` remains present. The static fallback is only for route loading; the Node server is what makes admin actions functional.

## 7. Test these URLs after deployment

Use a private/incognito browser window for the visitor checks, then sign in only with an approved administrator account.

| Test | Expected result |
|---|---|
| `https://YOUR-DOMAIN/` | The existing Trip Himalaya homepage renders unchanged. |
| `https://YOUR-DOMAIN/tours` | Public catalogue opens after a hard refresh. |
| `https://YOUR-DOMAIN/about` | Public About page opens after a hard refresh. |
| `https://YOUR-DOMAIN/admin` | Administrator login or authenticated admin workspace opens—not an Invalid Page. |
| `https://YOUR-DOMAIN/admin/login` | Direct refresh stays on the login screen. |
| Administrator sign-in | Loads the portal and data; it must not return an HTML page in an API error. |
| Create a test enquiry | Confirmation appears and the record appears in the admin portal. |
| Admin image upload | Works only after valid `CLOUDINARY_URL` is configured. |

## 8. If `/admin` still shows Invalid Page

First confirm that you deployed the **full Node project**, rather than only frontend files. Next, open Hostinger’s latest deployment log and check that `dist/index.js` exists after `npm run build`. Then confirm that the application start command is `npm start` (or entry file `dist/index.js`), all required environment variables are present, and the Node app was restarted after changing variables.

If you have only a static hosting plan, the `.htaccess` file can repair direct route loading but cannot supply the private `/api/trpc` backend. In that situation, use a Hostinger Node.js Web App plan or keep the existing full-stack deployment on Vercel/Manus while pointing your domain to it.

## 9. Do not do these things

| Do not | Why |
|---|---|
| Upload `.env` to GitHub or `public_html` | It exposes passwords and session secrets. |
| Run `npm run dev` in production | It is a development watcher, not a production server. |
| Upload only `dist/public` and expect admin actions to work | It contains no API server or database connection. |
| Replace `/api/*` with an SPA rewrite | It breaks the administrator API and sign-in requests. |
| Run `npm run db:push` on the older local TiDB schema | Use the safe manual migration guidance already provided. |

## 10. What to send next

Send a screenshot showing the **Hostinger plan name** and whether hPanel displays **Node.js Web App / Deploy Web App**. If there is a deployment error, send only the error text from the build log—never send your database URL, JWT secret, setup key, or Cloudinary secret.

## References

[1] [Hostinger: How to deploy a Node.js website](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)
