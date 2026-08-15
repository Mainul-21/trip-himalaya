# Vercel deployment guide

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

## Required environment services

The public interface will render after the build configuration above. The booking, enquiry, administrator, authentication, database, and media-upload features additionally require production equivalents for the database, session secret, OAuth/authentication service, object storage, and the public `VITE_*` configuration values. Add those values in **Vercel → Project Settings → Environment Variables**; do not commit them to this repository.

> The managed Manus deployment is already configured with those platform services. When using Vercel, provision and configure your own compatible services before relying on the live admin or visitor-submission features.

## Redeploy

After the repository is pushed, open the Vercel deployment, select **Redeploy**, and enable **Use existing Build Cache** only after the first successful deployment. The deployment should then show the Trip Himalaya website rather than raw project text.
