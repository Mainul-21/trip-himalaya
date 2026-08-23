# Fix the Agency Profile editor on the live website

> **What this fixes:** The live website currently reports `schemaNeedsUpdate: true`. This means its `agencyProfiles` table is older than the current application. The public website can still show saved profile details, but the protected Agency Profile editor remains locked to prevent an unsafe save.

This guide adds **only missing nullable content columns** (plus two safe defaulted columns) to the existing table. It does **not** delete or rewrite tours, bookings, enquiries, users, reviews, or saved agency details.

## Important safety rules

| Do | Do not do |
| --- | --- |
| Use the **TiDB Cloud SQL Editor** for the database connected to Hostinger. | Do **not** run `npm run db:push`. |
| Run the inspection query first. | Do **not** run `DROP`, `TRUNCATE`, `DELETE`, or any primary-key command. |
| Run **only** the `ALTER TABLE` statements for columns that are missing. | Do **not** paste a password, connection string, or screenshot containing secrets into chat. |
| Redeploy from Hostinger after completing the SQL. | Do **not** run all statements as one block if a column already exists. |

## Step 1 — Open the correct TiDB database

1. Sign in to **TiDB Cloud** in your own browser.
2. Open the cluster used by the Trip Himalaya Hostinger website.
3. Open **SQL Editor**.
4. Choose the `trip_himalaya` database if TiDB asks you to choose a database.
5. Run this small check first:

```sql
SELECT DATABASE() AS selected_database;
```

The result should say `trip_himalaya`. If it does not, stop. Select the correct database before continuing.

## Step 2 — Inspect the Agency Profile columns

Copy **only** this SQL block into the TiDB SQL Editor and run it:

```sql
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'agencyProfiles'
  AND COLUMN_NAME IN (
    'reviewSectionTitle',
    'reviewSectionIntro',
    'reviewCtaLabel',
    'reviewCtaEnabled',
    'exploreTitle',
    'exploreIntro',
    'travelStylesJson',
    'touristCount',
    'tourCount',
    'thirdMetricLabel',
    'thirdMetricValue',
    'experiencesTitle',
    'experiencesIntro',
    'experiencesJson',
    'aboutStoryTitle',
    'aboutStoryBody',
    'aboutStorySecondBody',
    'heroTitle',
    'heroAccentTitle',
    'heroSubtitle',
    'heroImagesJson',
    'heroBadgesJson',
    'whyTripTitle',
    'whyTripItemsJson'
  )
ORDER BY COLUMN_NAME;
```

If the `agencyProfiles` table itself is not found, **stop**. That means Hostinger is connected to a different database, and these column commands should not be run until the connection target is corrected.

## Step 3 — Add only the columns missing from the result

Compare the returned column names with the table below. For every name that is **not** in the result, copy and run its SQL statement **one line at a time**. If TiDB says `Duplicate column name`, do not rerun that line; move to the next missing field.

> **If the Step 2 result says `empty set`:** all 24 listed profile columns are missing. Use the copy-paste-ready file `agencyProfiles_add_missing_columns.sql` in this project. It contains exactly the 24 additive statements below and no destructive commands. Run the file as a script in the TiDB Cloud SQL Editor only after confirming `SELECT DATABASE()` returns `trip_himalaya`.

| Missing column | Run only this statement |
| --- | --- |
| `reviewSectionTitle` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`reviewSectionTitle\` varchar(160) NULL;` |
| `reviewSectionIntro` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`reviewSectionIntro\` varchar(500) NULL;` |
| `reviewCtaLabel` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`reviewCtaLabel\` varchar(80) NULL;` |
| `reviewCtaEnabled` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`reviewCtaEnabled\` boolean NOT NULL DEFAULT true;` |
| `exploreTitle` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`exploreTitle\` varchar(220) NOT NULL DEFAULT 'Choose your travel style.';` |
| `exploreIntro` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`exploreIntro\` text NULL;` |
| `travelStylesJson` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`travelStylesJson\` text NULL;` |
| `touristCount` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`touristCount\` varchar(80) NULL;` |
| `tourCount` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`tourCount\` varchar(80) NULL;` |
| `thirdMetricLabel` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`thirdMetricLabel\` varchar(80) NULL;` |
| `thirdMetricValue` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`thirdMetricValue\` varchar(80) NULL;` |
| `experiencesTitle` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`experiencesTitle\` varchar(220) NULL;` |
| `experiencesIntro` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`experiencesIntro\` text NULL;` |
| `experiencesJson` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`experiencesJson\` text NULL;` |
| `aboutStoryTitle` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`aboutStoryTitle\` varchar(220) NULL;` |
| `aboutStoryBody` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`aboutStoryBody\` text NULL;` |
| `aboutStorySecondBody` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`aboutStorySecondBody\` text NULL;` |
| `heroTitle` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`heroTitle\` varchar(160) NULL;` |
| `heroAccentTitle` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`heroAccentTitle\` varchar(160) NULL;` |
| `heroSubtitle` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`heroSubtitle\` varchar(280) NULL;` |
| `heroImagesJson` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`heroImagesJson\` text NULL;` |
| `heroBadgesJson` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`heroBadgesJson\` text NULL;` |
| `whyTripTitle` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`whyTripTitle\` varchar(160) NULL;` |
| `whyTripItemsJson` | `ALTER TABLE \`agencyProfiles\` ADD COLUMN \`whyTripItemsJson\` text NULL;` |

## Step 4 — Verify the database update

Run the inspection query from **Step 2** again. It should now list all 24 column names. This confirms the table has the application’s required profile fields.

## Step 5 — Redeploy and check the editor

1. Go to **Hostinger → Websites → triphimalya.com → Deployments**.
2. Click **Redeploy** for the current `main` branch and wait until the status is **Successful**.
3. Open `https://triphimalya.com/admin` in an incognito/private browser window.
4. Sign in and open **Agency Profile**.
5. Select **Check again**. The editor should unlock without changing any existing data.

If it is still locked after this, do not perform any more SQL changes. Reply only with **“SQL complete and redeployed”**. The live API can then be checked safely without sharing credentials.

## Why this is the correct recovery

The application locks the editor only when its full Agency Profile read encounters a missing profile column. The live API currently confirms this exact condition with `schemaNeedsUpdate: true`. All commands above are `ALTER TABLE ... ADD COLUMN` commands aligned to the project’s reviewed additive migrations; they preserve existing rows and do not alter primary keys. TiDB documents `ADD COLUMN` as the appropriate schema operation for adding columns. [1]

## References

[1]: https://docs.pingcap.com/tidb/stable/sql-statement-add-column/ "TiDB ADD COLUMN SQL Statement Reference"
