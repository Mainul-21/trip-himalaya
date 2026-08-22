# Hostinger EACCES Deployment Investigation Notes

## Authoritative sources consulted — 21 August 2026

Hostinger directs Node.js application owners to inspect the failed deployment’s full **Build logs** from **Websites → Dashboard → Deployments → failed build → Build logs**. It specifically advises checking the lines marked as errors and the end of the log, confirming the selected Node version, environment variables, package scripts, and ensuring that `node_modules` is not supplied in a ZIP deployment. The exact error line and surrounding stack are required before applying a permission-oriented workaround. Source: [Hostinger — How to troubleshoot Node.js deployment build errors](https://www.hostinger.com/support/how-to-troubleshoot-a-failed-node-js-deployment-using-build-logs/).

The original pnpm 11 configuration and permission workarounds did not resolve the managed-workspace failure. The project now uses a single npm 10.9.2 contract with a Linux-generated `package-lock.json`, validated by a clean npm install and production build. Trusted package lifecycle scripts remain enabled.

## Current safety conclusion

The Hostinger-generated recommendation to set `ignore-scripts=true` is unsuitable for this project because esbuild and the Tailwind native package need their permitted installation scripts to complete. Manual `chmod` in the application build command is also not an established fix until the exact `EACCES` target and deployment log context are known. The next required evidence is a sanitized extract of the Hostinger Build log containing the `EACCES` error and roughly 20 lines before and after it.

## Sanitized Hostinger build-log evidence received

The supplied build log confirms that dependency resolution and linking finish successfully, and `@tailwindcss/oxide` completes its permitted postinstall script. The failure occurs only when three esbuild copies validate their binary by spawning it with `--version`. Each attempt fails with `EACCES` against a path below `/home/u880874999/domains/triphimalya.com/hbuilds/source/repository/node_modules/.../esbuild/bin/esbuild`.

This is not a missing-build-approval issue: pnpm started the approved scripts. It is an executable-bit or no-exec deployment-filesystem condition affecting the installed native binary. The esbuild maintainer identifies the corresponding failure pattern as a missing executable permission bit that the package manager or environment must preserve, not an esbuild application-code error. Source: [evanw/esbuild issue #3510](https://github.com/evanw/esbuild/issues/3510).

## Local environment comparison and alternative install validation

In the managed development environment, both `node_modules/esbuild/bin/esbuild` and the resolved Linux esbuild binary have executable mode `755`. The failing Hostinger paths therefore reflect a deployment-environment permission problem, not a committed-file permission problem.

A clean pnpm 11.22.0 install with `NODE_ENV=production` still installed esbuild and the Tailwind oxide package. The setting is not a replacement for a true production-only install in this setup. pnpm documents `--prod` as the option that omits `devDependencies`; however, it cannot be used for the Hostinger build because Vite and esbuild are build-time dependencies. Source: [pnpm install](https://pnpm.io/cli/install).

An isolated npm installation initially exposed a stale Linux optional-dependency gap in the old npm lockfile. After regenerating that lockfile on Linux, a clean `npm ci` installed all native dependencies, tests passed, TypeScript passed, and the production bundle succeeded. npm is now the chosen deployment path because it eliminates the repository’s conflicting pnpm lockfile and pnpm-specific native-install policy.

## Final evidence and required Hostinger action

The latest sanitized Hostinger log provides conclusive evidence that its deployment workspace cannot execute native files under the repository `node_modules` path. pnpm completes dependency resolution and links all 407 packages. The approved Tailwind native dependency then finishes successfully. Three separate esbuild copies subsequently fail when their own installer runs `esbuild --version`:

- `node_modules/vitest/node_modules/esbuild/bin/esbuild`
- `node_modules/@esbuild-kit/core-utils/node_modules/esbuild/bin/esbuild`
- `node_modules/esbuild/bin/esbuild`

Each failure is `spawnSync … EACCES` beneath `/home/u880874999/domains/triphimalya.com/hbuilds/source/repository/node_modules/`. Since independent packages fail at the same executable-filesystem boundary after pnpm has allowed their scripts, this is not an application source-code error, an unapproved-build issue, or a missing dependency. A project `postinstall` hook cannot fix it because the installer fails before that hook can run; `ignore-scripts` is invalid because the build still needs the esbuild binary.

The owner should redeploy the latest `main` branch using Express, Node 22.x, **npm**, root `./`, entry file `dist/index.js`, and `NODE_ENV=production`. If the same failure occurs during `npm ci`, the owner must ask Hostinger to clear or recreate the affected Web App build workspace and npm cache, verify its mount permits execution for the Web App deployment user, and keep lifecycle scripts enabled.
