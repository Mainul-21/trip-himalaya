# Trip Himalaya local troubleshooting

This guide is for the Windows PowerShell local project. It diagnoses failures without printing passwords, replacing tour data, truncating tables, or inventing records.

## Confirm the environment

From the repository root, confirm that `.env` exists locally and is ignored by Git:

```powershell
Test-Path .env
Get-Content .gitignore | Select-String "\.env"
```

`DATABASE_URL` must use the exact TiDB host and database name from TiDB Cloud **Connect → Node.js (mysql2)**. If the password contains `@`, `:`, `/`, `?`, `#`, `%`, or `&`, encode only the password:

```powershell
$password = Read-Host "Paste TiDB password"
[System.Uri]::EscapeDataString($password)
```

Never paste the complete connection string into chat or commit it to GitHub.

## Diagnose `ETIMEDOUT`, connection refused, or SSL errors

These failures happen before the application can read a table. Check the endpoint without exposing credentials:

```powershell
$line = Get-Content .env | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
if (-not $line) { Write-Host "DATABASE_URL is missing from .env"; exit 1 }
if ($line -match '@([^:/?]+)(?::\d+)?/') { $host = $matches[1]; Write-Host "Checking host: $host"; Test-NetConnection $host -Port 4000 }
```

A failed TCP check means the endpoint, port, network, or provider availability must be corrected before `pnpm db:push` can work. Do not repeatedly run migrations while the endpoint is unreachable. For an SSL error, copy the current Node.js connection string from TiDB and preserve its SSL query parameters exactly.

## Diagnose Drizzle duplicate-column or duplicate-key messages

Do not select a truncate option when Drizzle asks whether to remove existing tour data. Stop the command and inspect the live schema in the TiDB SQL Editor:

```sql
SHOW COLUMNS FROM agencyProfiles;
SHOW COLUMNS FROM tours;
SHOW CREATE TABLE agencyProfiles;
SHOW CREATE TABLE tours;
```

If a column already exists, do not add it again. Compare its type and nullability with `drizzle/schema.ts`, then apply only a reviewed additive change. If a primary key or unique index already exists, do not recreate it and do not truncate the table.

## Agency Profile stays on “Loading public agency profile…”

If the browser console shows a failed `agency.get` query selecting `exploreTitle`, `exploreIntro`, or `travelStylesJson`, the local `agencyProfiles` table is from an older project version. The current editor now shows a recovery message rather than retrying the failed request repeatedly.

From the project folder, run:

```powershell
npm run db:push
```

If Drizzle asks whether to truncate data, choose the non-destructive option. After it finishes, stop the server with `Ctrl + C` and run `npm run dev` again. Do not delete the `agencyProfiles` row: the migration only adds the newer Explore Himachal fields and preserves existing contact, logo, and social-profile settings.

## Distinguish an empty catalogue from an unavailable API

Start the server with `pnpm dev`. In a second PowerShell window, request the public tour procedure:

```powershell
$q = [uri]::EscapeDataString('{"0":{"json":null}}')
try {
  $r = Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/trpc/tours.list?batch=1&input=$q"
  "STATUS=$($r.StatusCode) LENGTH=$($r.Content.Length)"
  $r.Content.Substring(0, [Math]::Min(500, $r.Content.Length))
} catch {
  "REQUEST_FAILED=$($_.Exception.Message)"
}
```

A successful response containing an empty array means the API responded but no published tours are available to that query. HTTP 500 means the server could not complete the database operation; inspect the terminal running `pnpm dev` and `.manus-logs` for the database error. A browser spinner or error panel alone does not prove that the database is empty.

## Administrator sign-in says “not valid JSON” or starts with “The page …”

The administrator sign-in page uses the same local tRPC endpoint. With the current code, a correct request returns `application/json`; an incorrect `/api/...` route also returns a JSON 404 instead of the website HTML. First stop every open local server window with `Ctrl + C`, pull the latest project files, and start exactly one server from the project root:

```powershell
git pull origin main
pnpm dev
```

In another PowerShell window, verify the administrator setup endpoint without entering an email or password:

```powershell
$q = [uri]::EscapeDataString('{"0":{"json":null}}')
$r = Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/trpc/adminAuth.setupStatus?batch=1&input=$q"
"STATUS=$($r.StatusCode) TYPE=$($r.Headers['Content-Type'])"
$r.Content
```

The result must report `application/json` and contain a tRPC result. If you instead receive website HTML, the browser is reaching an old process, a different folder, or a server on a different port. Stop all Node processes associated with this project, restart `pnpm dev` from the repository root, and use the exact `http://localhost:<port>` address printed by the terminal. Do not change credentials, database rows, or browser cookies to solve an HTML response.

## Resolve a `PublicPage.tsx` merge conflict safely

The current approved source has no conflict markers and contains this line in `client/src/pages/PublicPage.tsx`:

```tsx
const storyTitle = agencyProfile?.aboutStoryTitle || "Our story";
```

If Git reports a conflict in this file on a Windows computer, first make a backup of the local file outside the source tree. Then restore the current approved version from the remote main branch and restart the development server:

```powershell
git status
Copy-Item client/src/pages/PublicPage.tsx ..\PublicPage.local-backup.txt
git fetch origin
git checkout origin/main -- client/src/pages/PublicPage.tsx
git add client/src/pages/PublicPage.tsx
git commit -m "Resolve PublicPage merge conflict"
git pull origin main
pnpm dev
```

The backup preserves any local wording that you may later want to compare manually. Do not copy conflict-marker lines such as `<<<<<<<`, `=======`, or `>>>>>>>` into the source file. If `git status` reports conflicts in any other file, stop before committing and resolve those files separately; do not use a force reset.

## Safe recovery order

Verify `.env`, test the TiDB host and port, restart `pnpm dev`, query the API, inspect exact table definitions, and then apply only reviewed additive schema changes. Never seed or truncate production or user-owned tour records as a troubleshooting step.

## Image-loading failures

If tour text loads but an image does not, inspect the image URL in the browser network panel. Managed `/manus-storage/` URLs require the managed environment. Local Windows and standalone Vercel uploads should use the configured owner-controlled Cloudinary path described in `LOCAL_ENVIRONMENT_SETUP.md`. A missing image alone does not indicate a database failure.

## References

[1]: https://docs.pingcap.com/tidbcloud/connect-via-mysql2/ "TiDB Cloud MySQL2 connection guidance"
[2]: https://orm.drizzle.team/docs/kit-overview "Drizzle Kit documentation"

*Prepared for Trip Himalaya by Manus AI.*
