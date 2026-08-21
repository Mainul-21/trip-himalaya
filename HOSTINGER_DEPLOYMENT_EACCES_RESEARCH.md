# Hostinger EACCES Deployment Investigation Notes

## Authoritative sources consulted — 21 August 2026

Hostinger directs Node.js application owners to inspect the failed deployment’s full **Build logs** from **Websites → Dashboard → Deployments → failed build → Build logs**. It specifically advises checking the lines marked as errors and the end of the log, confirming the selected Node version, environment variables, package scripts, and ensuring that `node_modules` is not supplied in a ZIP deployment. The exact error line and surrounding stack are required before applying a permission-oriented workaround. Source: [Hostinger — How to troubleshoot Node.js deployment build errors](https://www.hostinger.com/support/how-to-troubleshoot-a-failed-node-js-deployment-using-build-logs/).

pnpm 11 configuration other than registry/auth settings belongs in the committed root `pnpm-workspace.yaml`; it identifies `allowBuilds`, `nodeLinker`, `unsafePerm`, and `ignoreScripts` as build-related settings. The project already uses the supported `allowBuilds` policy to permit only `@tailwindcss/oxide` and `esbuild`, rather than disabling scripts. Source: [pnpm — Settings (pnpm-workspace.yaml)](https://pnpm.io/settings).

## Current safety conclusion

The Hostinger-generated recommendation to set `ignore-scripts=true` is unsuitable for this project because esbuild and the Tailwind native package need their permitted installation scripts to complete. Manual `chmod` in the application build command is also not an established fix until the exact `EACCES` target and deployment log context are known. The next required evidence is a sanitized extract of the Hostinger Build log containing the `EACCES` error and roughly 20 lines before and after it.

## Sanitized Hostinger build-log evidence received

The supplied build log confirms that dependency resolution and linking finish successfully, and `@tailwindcss/oxide` completes its permitted postinstall script. The failure occurs only when three esbuild copies validate their binary by spawning it with `--version`. Each attempt fails with `EACCES` against a path below `/home/u880874999/domains/triphimalya.com/hbuilds/source/repository/node_modules/.../esbuild/bin/esbuild`.

This is not a missing-build-approval issue: pnpm started the approved scripts. It is an executable-bit or no-exec deployment-filesystem condition affecting the installed native binary. The esbuild maintainer identifies the corresponding failure pattern as a missing executable permission bit that the package manager or environment must preserve, not an esbuild application-code error. Source: [evanw/esbuild issue #3510](https://github.com/evanw/esbuild/issues/3510).

## Local environment comparison and alternative install validation

In the managed development environment, both `node_modules/esbuild/bin/esbuild` and the resolved Linux esbuild binary have executable mode `755`. The failing Hostinger paths therefore reflect a deployment-environment permission problem, not a committed-file permission problem.

A clean pnpm 11.22.0 install with `NODE_ENV=production` still installed esbuild and the Tailwind oxide package. The setting is not a replacement for a true production-only install in this setup. pnpm documents `--prod` as the option that omits `devDependencies`; however, it cannot be used for the Hostinger build because Vite and esbuild are build-time dependencies. Source: [pnpm install](https://pnpm.io/cli/install).

A clean npm installation in an isolated copy installed esbuild successfully with both direct and platform binaries on mode `755`, and `esbuild --version` ran successfully. This supports the panel-level npm fallback for Hostinger’s pnpm virtual-store EACCES condition. The first complete npm build test uncovered a separate npm optional-dependency resolution issue for Rollup’s platform package, so the fallback must be validated with a package-lock-consistent npm install before being presented as a final deployment resolution.
