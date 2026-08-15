# Trip Himalaya — Windows setup and upload

This project now installs without the old Vite peer-dependency conflict. **Do not use** `--force` or `--legacy-peer-deps`.

## Fastest upload: deploy from GitHub to Vercel

The private repository is already available at `Mainul-21/triphimalaya02`. You do **not** need to run the project locally before uploading it.

1. Open [Vercel](https://vercel.com/new) and choose **Import Git Repository**.
2. Select **`Mainul-21/triphimalaya02`**.
3. Use these settings exactly.

| Vercel setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root Directory | `.` (repository root, **not** `client`) |
| Node.js version | 22.x |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm vercel:build` |
| Output Directory | `dist/public` |

4. Add the required production environment variables in **Project Settings → Environment Variables**. The live booking, admin, database and image-upload features require your own database, session secret and storage settings. Never commit these values to GitHub.
5. Click **Deploy**. When it finishes, visit `https://YOUR-DOMAIN/api/health`. A correct deployment returns:

```json
{"ok":true,"service":"trip-himalaya-api"}
```

> If the Vercel home page is blank, first confirm that **Root Directory** is `.`. A root directory of `client` skips the required Vercel routing configuration.

## Run it on your Windows computer

Install **Node.js 22 LTS** and Git first. Open PowerShell in the repository folder.

```powershell
git clone https://github.com/Mainul-21/triphimalaya02.git
cd triphimalaya02
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Then open the local URL printed in PowerShell, normally `http://localhost:3000`.

If you prefer npm, first pull the latest `main` branch and run:

```powershell
git pull origin main
npm install
npm run check
npm run build
```

The project’s existing production services are configured in the managed deployment. To run the full administrator, bookings, database and upload workflows locally, create a local environment configuration with your own compatible service values; do not copy or publish production secrets.

## Update your local copy

Whenever a new version has been pushed, run:

```powershell
git pull origin main
pnpm install --frozen-lockfile
```
