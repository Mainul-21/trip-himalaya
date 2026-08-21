# Local Agency Profile Database Recovery

Use this guide only when the local administrator editor says that the `agencyProfiles` table is missing newer fields. This is the safe alternative to `npm run db:push` for the older local TiDB schema that can otherwise attempt to add an already-existing primary key.

> Do **not** run `npm run db:push` for this recovery. Do **not** run `DROP`, `TRUNCATE`, or any statement that adds or changes a primary key. The statements below add nullable profile-content columns only; they do not modify tours, users, bookings, enquiries, or existing agency-profile values.

## 1. Inspect before changing anything

In the TiDB Cloud SQL Editor, select the `trip_himalaya` database and run the following query. It reports which of the required columns already exist. **Copy only the text inside the SQL code block below. Do not paste the website warning, any explanatory sentence, Markdown backticks, or any other text into the SQL Editor.**

```sql
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'agencyProfiles'
  AND COLUMN_NAME IN (
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

## 2. Add only the missing columns

Compare the result with the table below. Run **only** the `ALTER TABLE` lines for columns that were absent from the inspection result. Each new column is nullable, so existing agency-profile rows retain their saved values and the application uses safe content fallbacks until an administrator saves a value.

| Missing column | Run this one statement |
|---|---|
| `experiencesTitle` | `ALTER TABLE agencyProfiles ADD COLUMN experiencesTitle varchar(220) NULL;` |
| `experiencesIntro` | `ALTER TABLE agencyProfiles ADD COLUMN experiencesIntro text NULL;` |
| `experiencesJson` | `ALTER TABLE agencyProfiles ADD COLUMN experiencesJson text NULL;` |
| `aboutStoryTitle` | `ALTER TABLE agencyProfiles ADD COLUMN aboutStoryTitle varchar(220) NULL;` |
| `aboutStoryBody` | `ALTER TABLE agencyProfiles ADD COLUMN aboutStoryBody text NULL;` |
| `aboutStorySecondBody` | `ALTER TABLE agencyProfiles ADD COLUMN aboutStorySecondBody text NULL;` |
| `heroTitle` | `ALTER TABLE agencyProfiles ADD COLUMN heroTitle varchar(160) NULL;` |
| `heroAccentTitle` | `ALTER TABLE agencyProfiles ADD COLUMN heroAccentTitle varchar(160) NULL;` |
| `heroSubtitle` | `ALTER TABLE agencyProfiles ADD COLUMN heroSubtitle varchar(280) NULL;` |
| `heroImagesJson` | `ALTER TABLE agencyProfiles ADD COLUMN heroImagesJson text NULL;` |
| `heroBadgesJson` | `ALTER TABLE agencyProfiles ADD COLUMN heroBadgesJson text NULL;` |
| `whyTripTitle` | `ALTER TABLE agencyProfiles ADD COLUMN whyTripTitle varchar(160) NULL;` |
| `whyTripItemsJson` | `ALTER TABLE agencyProfiles ADD COLUMN whyTripItemsJson text NULL;` |

If TiDB says **Duplicate column name**, do not retry that line. It means that specific column already exists; continue with the other missing columns only.

## 3. Verify and restart locally

Run the inspection query in step 1 again. It should return all 13 column names. Then, from the project folder in PowerShell, stop the current server with `Ctrl+C` and start it again:

```powershell
npm run dev
```

Open `http://localhost:3000/admin` and sign in. The Agency Profile editor should load. Existing public agency settings, tours, bookings, and enquiries are not rewritten by this process.

## Why this is safe

The current project migrations `0012_wooden_mandarin.sql` and `0013_lovely_thunderball.sql` contain only these column additions. TiDB documents `ALTER TABLE ... ADD COLUMN` as an online operation that does not block table reads or writes. [1]

## References

[1]: https://docs.pingcap.com/tidb/stable/sql-statement-add-column/ "TiDB ADD COLUMN SQL Statement Reference"
