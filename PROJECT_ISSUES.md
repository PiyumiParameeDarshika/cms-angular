# Project Issues Identified

## 1) Dependency resolution fails on a clean install
- Running `npm install` fails with `ERESOLVE unable to resolve dependency tree`.
- Root cause: `ng2-charts@6.0.1` pulls `@angular/cdk@21.2.0` (peer range `^21 || ^22`) while the app is pinned to Angular 19 packages.
- Impact: new developers/CI cannot install dependencies reliably without workarounds (`--legacy-peer-deps`/`--force`), and those workarounds may produce an unsupported dependency set.

## 2) Environment has registry/policy blocking dependency fetches
- Running `npm install --legacy-peer-deps` still fails with `403 Forbidden` while fetching `@angular-devkit/build-angular` from npm registry.
- Impact: build and verification steps are blocked in this environment unless registry auth/policy is corrected.

## 3) Duplicate production environment files create ambiguity
- Both files exist with effectively the same production config:
  - `src/environments/environment.prod.ts`
  - `src/environments/environment.production.ts`
- `angular.json` does not define file replacements for environments.
- Impact: unclear which production environment file should be authoritative and higher chance of config drift.

## 4) Placeholder production API endpoint is committed
- Production environment files use `https://your-production-domain.com/api/v1`.
- Impact: production builds can point to a non-real endpoint unless replaced externally.

## 5) Missing quality scripts in package scripts
- `package.json` includes `start`, `build`, and `watch`, but there are no `test` or `lint` scripts.
- Impact: no standard one-command validation path for code quality in CI/local workflows.
