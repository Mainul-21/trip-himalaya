# Next.js Migration Reference

## Authoritative sources consulted

| Topic | Key implementation finding | Official source |
|---|---|---|
| Vite-to-Next migration | Start by installing Next.js, create an App Router root layout, and migrate routes incrementally rather than discarding a working app in one step. | [Next.js: Migrating from Vite](https://nextjs.org/docs/app/guides/migrating/from-vite) |
| Node support | Current Next.js installation guidance requires Node.js 20.9 or newer; Hostinger Node 22.x meets this requirement. | [Next.js: Installation](https://nextjs.org/docs/app/getting-started/installation) |
| Production server | A full-stack, database-backed Next.js site must use a Node server (`next start` or standalone server output), not a static export. | [Next.js: Self-hosting](https://nextjs.org/docs/app/guides/self-hosting) |
| Environment variables | Private environment values remain server-only unless explicitly prefixed `NEXT_PUBLIC_`; database and session secrets must not receive that prefix. | [Next.js: Self-hosting](https://nextjs.org/docs/app/guides/self-hosting) |

## Migration decision

Trip Himalaya will be migrated as a **Node-hosted Next.js App Router** application. It will not use `output: 'export'`, because the public tours, administrator portal, credential sessions, image uploads, enquiries, and TiDB database all require server-side execution.

The existing Drizzle schema and database rows will be retained. The current Vite/Express implementation remains available during the foundation phase so migration work is non-destructive.
