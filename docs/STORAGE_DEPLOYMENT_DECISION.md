# Storage and Deployment Decision Notes

## Current finding

The current media-upload procedure validates image bytes on the server and then calls the managed Forge storage service. This works in the managed development environment because its platform credentials are injected there. Those credentials are deliberately unavailable in a standalone local clone or a Vercel deployment, so an image upload in those environments cannot use the current managed-storage adapter.

The review record itself accepts an optional image URL; therefore, submitting a review without a newly uploaded photo depends on the database and administrator session, while uploading a local-device photo depends on a configured storage provider.

## Recommended Vercel-compatible path

Use a project-owned Cloudinary product environment for administrator media. Keep the Cloudinary API secret only on the server in Vercel environment variables; never expose it in browser code or commit it to Git.

| Configuration | Purpose | Visibility |
|---|---|---|
| `CLOUDINARY_URL` | Server-side Cloudinary SDK configuration with the account cloud name, API key, and API secret | Secret; server only |
| `DATABASE_URL` | Application data, including tours, reviews, and media metadata | Secret; server only |
| `JWT_SECRET` | Administrator-session signing | Secret; server only |

The site will retain server-side validation for JPEG, PNG, and WebP input before an upload. The image file is sent to the protected server procedure, which then uploads it to Cloudinary; the browser never receives the API secret.

## Official sources

Cloudinary's [Node.js SDK guide](https://cloudinary.com/documentation/node_integration) states that the SDK can be configured with a `CLOUDINARY_URL` environment variable and recommends keeping secrets out of version control. It also recommends the current SDK security release.

Cloudinary's [Upload API reference](https://cloudinary.com/documentation/image_upload_api_reference) states that server-side uploads use API credentials and explicitly warns never to expose the API secret in public client-side code. The same reference documents Node SDK signed uploads and their error handling.

Cloudinary's official [pricing page](https://cloudinary.com/pricing) currently lists a **$0 Free forever** plan with no credit card required. It includes three users per account and 25 monthly credits; Cloudinary describes one credit as 1 GB of managed storage, 1 GB of high-performance CDN image/video bandwidth, or 1,000 image/video transformations. The exact monthly use should be reviewed in the Cloudinary dashboard before relying on it for a high-traffic website.

## Dependency finding

The package audit reports dependency advisories, including a direct `axios` security update path. Major-version upgrades should not be performed blindly: first update the exact vulnerable packages and their parent dependencies, then run the complete test suite, TypeScript check, production build, and the administrator upload workflow.

## Required owner action

The project owner must create a Cloudinary account and provide the `CLOUDINARY_URL` only through the secret-management flow. No valid production credential can be generated, copied, or safely hard-coded by the application code.
