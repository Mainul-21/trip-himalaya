# Trip Himalaya — Vercel Domain Setup

The public website and API are deployed on **Vercel**. Keep Hostinger only as the domain registrar or DNS manager if that is where you bought `triphimalya.com`. Do **not** deploy the application to Hostinger and do not point the website records to a Hostinger web-app IP.

## 1. Confirm the Vercel project settings

Open [Vercel Dashboard](https://vercel.com/dashboard), select the project connected to `Mainul-21/triphimalaya02`, and use these values.

| Setting | Value |
|---|---|
| Framework | Vite |
| Root Directory | `.` |
| Build command | `pnpm vercel:build` |
| Output directory | `dist/public` |
| Node.js version | `22.x` |

Do not change the project to Next.js or static-only hosting. The repository includes the Vite frontend plus Vercel serverless API functions.

## 2. Add environment variables in Vercel

Go to **Project → Settings → Environment Variables**. Add these values for **Production**. Add the same values to Preview and Development only if you need those environments.

| Name | Value |
|---|---|
| `DATABASE_URL` | Your current TiDB/MySQL URL, after changing its exposed password. |
| `JWT_SECRET` | A new private, randomly generated secret with at least 32 bytes. |
| `CLOUDINARY_URL` | The Cloudinary API environment URL after its exposed credential is rotated. |

Do not add Manus-only `BUILT_IN_FORGE_*` values on Vercel. Do not paste secrets in GitHub, source code, screenshots, or chat. Environment-variable changes apply to the **next deployment**, so redeploy after saving them. [1]

## 3. Add the domain in Vercel

Open **Project → Settings → Domains** and add both addresses:

1. `triphimalya.com`
2. `www.triphimalya.com`

Set `triphimalya.com` as the primary domain and redirect `www.triphimalya.com` to it. Vercel will show the DNS entries that are correct for your account. [2]

## 4. Update the DNS at Hostinger

If the domain is managed at Hostinger, open **hPanel → Domains → triphimalya.com → DNS Zone Editor**. Change only the conflicting website records.

| Record | Host / Name | Value |
|---|---|---|
| A | `@` | Copy the apex A-record value shown in Vercel. It is commonly `76.76.21.21`, but use Vercel’s value. |
| CNAME | `www` | Copy the exact CNAME target Vercel shows for `www`. |

Remove old conflicting `@` and `www` website records, including any record pointing to the old Hostinger web-app IP. **Do not remove MX or email-related records.** If Vercel asks you to add a verification TXT record, add only that extra TXT record. Apex domains use an A record and `www` uses a CNAME. [2]

## 5. Redeploy and test

Open **Vercel → Deployments** and redeploy the latest `main` deployment. When it is **Ready**, test in an incognito window:

1. `https://triphimalya.com/api/health` — expected JSON includes `"ok": true` and `"service": "trip-himalaya-api"`.
2. `https://triphimalya.com` — homepage, images, and tours load.
3. `https://triphimalya.com/admin/login` — admin sign-in opens.
4. `https://www.triphimalya.com` — redirects to the primary domain.

If `/api/health` works but tours or the admin portal do not, recheck the three Vercel environment variables and redeploy. If the health URL fails, check Vercel’s Build and Functions logs and share only non-secret error lines.

## 6. Rotate exposed credentials before using the live admin portal

Earlier screenshots exposed the database, JWT, and Cloudinary credentials. Rotate each one now:

1. Create a new TiDB password, update `DATABASE_URL` in Vercel.
2. Generate a new random `JWT_SECRET`, update it in Vercel.
3. Regenerate the Cloudinary credential, update `CLOUDINARY_URL` in Vercel.
4. Redeploy after saving all three values.

## References

[1] [Vercel — Add and manage environment variables](https://vercel.com/kb/guide/how-to-add-vercel-environment-variables)

[2] [Vercel — Adding and configuring a custom domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
