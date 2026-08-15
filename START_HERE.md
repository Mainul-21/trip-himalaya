# Trip Himalaya: Start Here

This is the shortest safe route to run and deploy the website from a fresh GitHub clone. **Do not look for real API keys in GitHub.** Secrets are intentionally excluded so that nobody can take control of the database, administrator accounts, or image storage.

## 1. What you need

Install **Node.js 22 LTS** and Git. This project uses `pnpm`, which is included through Corepack on modern Node installations. You also need a MySQL-compatible database and, if administrators will upload images, a Cloudinary account.

| Item | Why it is needed | Where you add it |
|---|---|---|
| `DATABASE_URL` | Stores tours, bookings, enquiries, reviews, and administrator data | `.env` locally and Vercel environment variables |
| `JWT_SECRET` | Signs secure administrator-session cookies | `.env` locally and Vercel environment variables |
| `CLOUDINARY_URL` | Lets administrators upload tour and review photos on local hosting and Vercel | `.env` locally and Vercel environment variables |
| `INITIAL_ADMIN_SETUP_KEY` | Protects the one-time first principal setup on a hosted standalone site | Vercel environment variables, only until initial setup is complete |

> **Never send these values in chat, commit them to GitHub, or put them in `VITE_*` variables.** Server secrets must stay private.

## 2. First local run on Windows

Open PowerShell in the cloned project folder and run the following commands. The `pnpm dev` command starts both the React website and the secure API server together.

```powershell
corepack enable
pnpm install --frozen-lockfile
New-Item -Type File .env
```

Open the new `.env` file. Add the following key names with your own values. Do not use quotation marks around a Cloudinary value containing special characters unless Cloudinary supplied them as part of the exact string.

```env
DATABASE_URL='mysql://USER:URL_ENCODED_PASSWORD@HOST:3306/DATABASE_NAME?ssl={"rejectUnauthorized":true}'
JWT_SECRET="PASTE_A_LONG_RANDOM_SECRET_HERE"
CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
```

For TiDB Cloud, select **Node.js (mysql2)** on the Connect page, copy the connection string for your selected database, and replace `<PASSWORD>` with your saved password. Do not leave angle brackets in the URL. If the password contains `@`, `:`, `/`, `?`, `#`, `%`, or `&`, URL-encode it before adding it to the connection string.

Generate a safe session secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

When the database URL is ready, apply the schema and start the site:

```powershell
pnpm db:push
pnpm dev
```

Open the address shown in the terminal. Set up the principal administrator at `/admin/setup` only when the database has no administrator yet. Local setup creates that initial principal account directly. Afterwards, sign in at `/admin/login`.

## 3. Deploy to Vercel

Import the repository into Vercel and keep the configuration simple.

| Vercel setting | Value |
|---|---|
| Framework preset | `Vite` |
| Root Directory | `.` |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm vercel:build` |
| Output directory | `dist/public` |

In **Settings → Environment Variables**, add `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_URL`, and a separate random `INITIAL_ADMIN_SETUP_KEY` for **Production**, **Preview**, and **Development**. Redeploy after saving them. Enter that private setup key once in the optional field at the hosted `/admin/setup` page when you create the first principal administrator, then delete `INITIAL_ADMIN_SETUP_KEY` from Vercel. Then open `https://YOUR-DOMAIN/api/health`; a working deployment returns `{"ok":true,"service":"trip-himalaya-api"}`.

## 4. Cloudinary in one minute

Create a free Cloudinary account, open its dashboard, and copy the **API Environment Variable**. It begins with `cloudinary://`. Paste the complete value into `CLOUDINARY_URL` locally or in Vercel; it stays server-only. The administrator selects a photo, the server validates it, and the server uploads it to Cloudinary. The browser never receives the API secret.[1]

## 5. Commands you will use

| Command | Use it for |
|---|---|
| `pnpm dev` | Run the local website and API together |
| `pnpm test` | Run automated checks |
| `pnpm check` | Check TypeScript |
| `pnpm vercel:build` | Reproduce the Vercel production build locally |
| `pnpm db:push` | Apply the database schema after setting `DATABASE_URL` |
| `pnpm audit:prod` | Check production dependency advisories |

If a command fails, first check `.env`, then run `pnpm install --frozen-lockfile` again. Do not use `--force` or `--legacy-peer-deps`.

## References

[1]: https://cloudinary.com/documentation/node_integration "Cloudinary Node.js SDK integration"
