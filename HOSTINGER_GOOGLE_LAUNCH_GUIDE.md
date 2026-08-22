# Trip Himalaya: Hostinger Deployment and Google Launch Guide

This guide explains two separate jobs: first, make the complete Trip Himalaya application live on Hostinger; second, ask Google to discover and index the live public site. The administrator portal is a Node.js application with a database-backed API, so it cannot run correctly from a static `public_html` upload alone.

> **Do not click “Delete” on the Hostinger website card.** Delete removes website configuration/files; it does not enable Web Apps or fix the administrator portal.

## Part A — Confirm that Hostinger can run the full application

The previous screenshot showed **Premium Web Hosting**, which states **“No Web Apps.”** That plan can host static files, but the Trip Himalaya administrator portal requires a running Node.js/Express application for sign-in, database queries, enquiries, bookings, settings and uploads.

| Hostinger status | What it means | Next action |
|---|---|---|
| **Premium / No Web Apps** | Static/PHP web space only | Do not deploy the full admin application there. |
| **Business or higher / 5 Web Apps** | Suitable capability for this project | Continue only after hPanel actually displays the active Business plan and **Web Apps** menu. |
| Business purchase completed but dashboard still says Premium | The account change is not visible yet | Refresh hPanel, sign out/in once, then use Hostinger support if the active plan still remains Premium. |

Hostinger’s Node.js deployment guidance confirms that eligible hosting plans can deploy Node applications. [1]

## Part B — Prepare the deployment source

Use the GitHub repository **`Mainul-21/triphimalaya02`**, branch **`main`**. The repository must include all source code, not only frontend files. Required project items include `client/`, `server/`, `drizzle/`, `package.json`, `package-lock.json`, and the `client/public/.htaccess` routing fallback.

Do **not** upload any `.env` file to GitHub, File Manager, or `public_html`.

## Part C — Create the Web App

When the Business plan is shown as active, use **hPanel → Websites → Web Apps** or **Websites → Add Website → Deploy Web App**. Connect the GitHub repository, then use the following values.

| Field in Hostinger | Value |
|---|---|
| Repository | `Mainul-21/triphimalaya02` |
| Branch | `main` |
| App type | Node.js Web App; choose Express.js if Hostinger offers it, otherwise Other |
| Node.js version | 22.x |
| Package manager | npm 10.x |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm start` |
| Entry file if required instead of a start command | `dist/index.js` |
| Environment | `NODE_ENV=production` |

The build produces `dist/index.js` for the Express server and `dist/public` for the React visitor application. The `npm start` command runs the production server. Never use `npm run dev` in Hostinger production.

## Part D — Add secrets safely

Open the Web App’s **Environment Variables** panel and add each value one at a time. Enter real values from your private development/Vercel environment; do not send them in chat or screenshots.

| Variable | Required | What it does |
|---|---:|---|
| `NODE_ENV` | Yes | Set exactly to `production`. |
| `DATABASE_URL` | Yes | Connects the server to the TiDB/MySQL database. |
| `JWT_SECRET` | Yes | Signs administrator sessions securely. |
| `INITIAL_ADMIN_SETUP_KEY` | Yes | Protects the one-time principal administrator setup. |
| `CLOUDINARY_URL` | Yes for admin image uploads | Enables image storage for uploaded tour, stay, review and logo images. |
| `PORT` | Normally no | Let Hostinger provide it unless its UI explicitly asks for a value. |

The file [`HOSTINGER_ENV.example`](./HOSTINGER_ENV.example) is a safe name-only reference. It contains no real secrets.

## Part E — Deploy and verify the public website and admin portal

Start deployment from hPanel and wait for a successful install, build and start log. Do not replace Hostinger-generated server bridge files. The project’s `.htaccess` keeps direct client routes such as `/admin`, `/admin/login`, `/tours`, and `/about` loading through React while preserving `/api/*` for the backend.

| Check after deployment | Correct result |
|---|---|
| `https://triphimalya.com/` | Public homepage loads normally. |
| `https://triphimalya.com/tours` | Public catalogue loads after a browser refresh. |
| `https://triphimalya.com/admin` | Admin sign-in or signed-in workspace loads—not an Invalid Page. |
| `https://triphimalya.com/admin/login` | Direct refresh remains on admin login. |
| Admin sign-in | Tour, enquiry and profile data loads through `/api/trpc`. |
| Admin image upload | Works after valid Cloudinary configuration. |

If the admin route still fails, first check that the app is a **Node Web App**, that the build output includes `dist/index.js`, the start command is `npm start`, and every required variable is present. A static `public_html` upload cannot replace this backend.

## Part F — Put the website into Google Search

Google Search does not host your site. After the site is live at the final HTTPS domain, use **Google Search Console** to verify that you own the domain and ask Google to discover the public URLs.

1. Open [Google Search Console](https://search.google.com/search-console/) and sign in with the Google account that should own the website.
2. Click **Add property** and choose **Domain**. Enter `triphimalya.com` without `https://` or `www`.
3. Google will show a DNS TXT record. Open **Hostinger → Domains → DNS Zone Editor**, add that exact TXT record, save it, then return to Search Console and click **Verify**. Domain verification covers HTTP/HTTPS and subdomain versions. [2]
4. After verification, open **Sitemaps** in Search Console and submit `https://triphimalya.com/sitemap.xml` only if that file opens successfully in a browser. If the current deployment does not serve a sitemap yet, do not submit a non-existent address; first ask for the sitemap to be added.
5. Open **URL Inspection**, paste `https://triphimalya.com/`, select **Test Live URL**, then choose **Request indexing** if the page is accessible. Repeat only for the small number of key public pages: homepage, tours, about, contact, and Our Stay.
6. Do **not** request indexing for `/admin`, `/admin/login`, booking form submissions, or private dashboard paths.

Google says that URL recrawling can take days to weeks, and a request does not guarantee immediate inclusion in search results. For broader URL discovery, submit a valid sitemap. [3] [4]

## Part G — Final safety checklist

| Do | Do not |
|---|---|
| Use Hostinger Business Web Apps or a separate Node-capable host for the full app | Use Premium static/PHP hosting for a functioning admin portal |
| Keep `DATABASE_URL`, JWT and Cloudinary secrets in Environment Variables | Put secrets in `.env` uploads, GitHub, screenshots or chat |
| Test public routes and `/admin` after every deploy | Rewrite `/api/*` to `index.html` |
| Verify the final domain in Search Console only after it is live | Request Google indexing for private admin URLs |

## What to send before deployment

Send a screenshot showing the active **Business plan** and the **Web Apps / Deploy Web App** page. Hide payment details, passwords, database URLs and secret values. The next setup steps can then be confirmed field by field.

## References

[1] [Hostinger: How to deploy a Node.js website](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)

[2] [Google Search Console Help: Verify your site ownership](https://support.google.com/webmasters/answer/9008080?hl=en)

[3] [Google Search Central: Ask Google to recrawl your URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)

[4] [Google Search Central: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
