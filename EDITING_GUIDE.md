# Trip Himalaya: Editing Guide

This guide shows the safest places to edit the website after cloning it. The public website and the administrator portal already read from the same database, so use the admin portal for day-to-day content changes whenever possible.

## Everyday content edits

| What you want to change | Best place to change it |
|---|---|
| Tours, Top 4 order, tour images, day plans | `/admin/tours` after administrator sign-in |
| Reviews and star ratings | `/admin/reviews` after administrator sign-in |
| Photos available to tours and reviews | `/admin/media` after administrator sign-in |
| Booking and enquiry requests | `/admin` dashboard |
| Blog posts | `/admin/blogs` after administrator sign-in |

> **Do not create fake reviews, ratings, or traveller counts.** Publish only feedback that comes from real travellers.

## Main code locations

| Area | Main files | Safe use |
|---|---|---|
| Homepage | `client/src/pages/Home.tsx` | Adjust hero wording, CTA labels, and public section layout |
| About page | `client/src/pages/PublicPage.tsx` and `client/src/lib/aboutContent.ts` | Keep company wording brief and factual |
| Tours catalogue and details | `client/src/pages/Tours.tsx`, `client/src/pages/TourDetail.tsx` | Adjust public card and detail presentation |
| Public header and footer | `client/src/components/PublicLayout.tsx` | Adjust navigation, phone, WhatsApp, and footer text |
| Administrator portal | `client/src/pages/AdminPortal.tsx` | Adjust admin-only controls without exposing them publicly |
| Public styles | `client/src/index.css` | Change colours, type scale, spacing, and animations consistently |
| Server rules | `server/routers.ts` and `server/db.ts` | Change validation and database actions only with tests |
| Database tables | `drizzle/schema.ts` | Update the schema before applying database changes |

## Safe editing rules

Keep secrets only in `.env` or Vercel environment variables. Never edit files under `server/_core` unless a documented platform integration requires it. After any source-code change, run `pnpm test`, `pnpm check`, and `pnpm vercel:build` before deploying. Use the administrator portal rather than editing the database directly for tours, reviews, media, enquiries, and bookings.

## Where to ask for help

For a broken local install, start with `START_HERE.md`. For Vercel-specific behaviour, use `VERCEL_DEPLOYMENT.md`. For a detailed explanation of the environment variables, use `LOCAL_ENVIRONMENT_SETUP.md`.
