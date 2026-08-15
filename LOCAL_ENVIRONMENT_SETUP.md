# Local environment and API keys

## Why no keys are in GitHub

The GitHub repository deliberately does **not** contain API keys, database passwords, or session secrets. They are excluded by `.gitignore` so nobody can take control of the database, administrator sessions, or uploaded files from a public or shared copy of the project.

> Do not copy a secret into source code, commit a `.env` file, or send a key in chat. Keep it only in your own `.env` file on your PC and in the Environment Variables section of your deployment provider.

## The simplest option

If you only want to view the website on your computer, no API key is needed. In PowerShell, run:

```powershell
git clone https://github.com/Mainul-21/triphimalaya02.git
cd triphimalaya02
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address shown in PowerShell, usually `http://localhost:3000`. The design and public pages will load. Data-backed features such as bookings, enquiries, administrator data, and uploads need the services below.

## Full local administrator and booking setup

For the full website, create your own MySQL-compatible database (for example, MySQL, TiDB, PlanetScale, or a managed MySQL provider). Then create a file named `.env` in the repository root:

```env
DATABASE_URL="mysql://DATABASE_USER:DATABASE_PASSWORD@DATABASE_HOST:3306/DATABASE_NAME"
JWT_SECRET="PASTE_A_LONG_RANDOM_SECRET_HERE"
```

Generate a secure `JWT_SECRET` on your PC with Node.js:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value after `JWT_SECRET=`. Then run the database migration and start the website:

```powershell
pnpm db:push
pnpm dev
```

When the site opens, go to `/admin/setup` to create the first principal administrator account. This account uses the email-and-password administrator flow built into Trip Himalaya.

| Value | Needed for | Where to get it |
| --- | --- | --- |
| `DATABASE_URL` | Tours, bookings, enquiries, reviews, admins, blogs, and newsletter data | Your own MySQL-compatible database provider |
| `JWT_SECRET` | Secure administrator session cookies | Generate it yourself with the command above |
| `BUILT_IN_FORGE_API_URL` | Current managed image upload and delivery adapter | Automatically supplied only in the managed Manus environment |
| `BUILT_IN_FORGE_API_KEY` | Current managed image upload and delivery adapter | Automatically supplied only in the managed Manus environment |

## Important image-upload note

The current photo-upload feature uses the managed Manus storage adapter. The two `BUILT_IN_FORGE_*` values are **not ordinary public API keys** and cannot be recovered from GitHub or copied from the live managed deployment.

For local development, you can run the site with the database and session secret above. Image uploads will need either the managed Manus environment or a future storage change to your own Amazon S3, Cloudflare R2, or Cloudinary account. Do not invent Forge values or paste unknown keys into the project.

## Vercel setup

For Vercel, open **Project Settings → Environment Variables** and add your own values for:

```text
DATABASE_URL
JWT_SECRET
```

Use the following build settings:

| Vercel setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root Directory | `.` |
| Node.js version | 22.x |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm vercel:build` |
| Output Directory | `dist/public` |

The public website can build with those settings. To make administrator photo uploads work on Vercel, the managed storage adapter must be replaced with a storage provider you own; the required service keys should be added in Vercel, never in GitHub. After deployment, test `https://YOUR-DOMAIN/api/health`; the expected response is `{"ok":true,"service":"trip-himalaya-api"}`.

For the complete Vercel deployment settings, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md). For the basic Windows commands, see [WINDOWS_SETUP.md](./WINDOWS_SETUP.md).
