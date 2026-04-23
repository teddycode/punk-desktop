---
name: punk-project-integration
description: Integrate an external project into `punk-desktop` as either a native core page under `vite/packages/table/page/core/*`, a static frontend under `vite/html/service-name`, or a managed local service under `services/*`. Use when Codex needs to validate that a source project can build and run before integration, repair source-project errors first, classify whether it is frontend-only or service-backed, split frontend and backend, decide between direct core integration and static hosting, write `service.js` `build/start/health/stop` hooks when a backend exists, wire desktop or lightApp entry points, and verify frontend access to backend HTTP and websocket endpoints through the Electron local gateway.
---

# Punk Project Integration

## Overview

Turn an external codebase into a first-class Punk Desktop capability without breaking its original behavior. Reuse the existing `node-monitor` pattern: managed backend process, local gateway, static frontend hosting, `/api` proxying, websocket proxying, packaged runtime assets, and embedded-browser opening inside the desktop.

## Intake

Start by asking only for the missing facts:

1. Target module name under `vite/packages/table/page/core/*`.
2. Source code path of the project to integrate.
3. Whether the user expects a desktop icon/lightApp entry, a standalone app window, or only an internal module page.

Then inspect these repo touchpoints before changing code:

- `services/node-monitor/service.js`
- `main/serviceManager.js`
- `scripts/buildServices.js`
- `vite/packages/table/page/core/*`
- `vite/html/*`
- `src/model/data/appData.js`
- `vite/packages/table/js/data/desktopData.ts`
- `src/main/appManager.js`
- `src/main/tableTabManager.js`

Compare the target project against `node-monitor` instead of inventing a new integration shape.

## Pre-Integration Gate

Do not integrate a broken project into this repo. Validate the source project first and fix its errors before touching the main app integration path.

Run this gate in the source project directory, or in a temporary copy of it, before moving code into `punk-desktop`:

1. Identify the native install, build, test, and run commands from the project itself.
2. Install dependencies only in the source project scope, not in the main repo root unless integration has already been approved and scoped.
3. Run the smallest realistic proof that the project works:
   - frontend-only project: dependency install, build, and local startup or preview
   - backend-only project: dependency install, build if required, local startup, and a health or smoke request
   - full-stack project: build or start both sides and verify frontend-to-backend connectivity in the source project first
4. Capture concrete failures from logs, terminal output, missing files, bad imports, bad env vars, broken scripts, or runtime exceptions.
5. Fix the source project errors first, then rerun the same validation until it passes.

Only continue into Punk integration when the project has a repeatable green baseline.

If the source project cannot be made to run in a bounded amount of work, stop the integration flow and report the blockers instead of partially merging broken code into the main app.

## Source Project Validation

Choose validation depth based on project shape, but always prove that the source project works on its own terms before adapting it.

For frontend projects, verify:

- dependency installation succeeds with the project's own package manager
- the production build succeeds
- the page starts in dev, preview, or static-serve mode
- the main routes and critical assets load without blank screen or fatal console errors

For backend projects, verify:

- dependency installation succeeds with the project's own runtime and package manager
- compile, package, or binary build succeeds when the project expects one
- the backend process starts with the documented command
- at least one health, ping, login, or key data endpoint responds successfully

For full-stack projects, verify:

- frontend and backend can both start from the source project
- the frontend can reach the backend with the source project's expected API configuration
- websocket or SSE flows work if the project depends on them

Prefer fixing startup scripts, import paths, env handling, build config, and missing runtime files in the source project before designing Punk-specific wrappers around them.

## Classify Project Shape

Determine the project shape before choosing the integration path.

Treat the project as frontend-only when most of these are true:

- the provided code contains a frontend app structure such as `src`, `public`, `index.html`, `vite.config.*`, `webpack.config.*`, or `package.json`
- there is no local server entry such as `server.*`, `main.*`, `app.*`, `manage.py`, `pom.xml`, `go.mod`, backend Dockerfile, or dedicated API runtime folder
- there is no backend build script, no backend binary output, and no local health endpoint to expose
- the page can function as static assets, or it only talks to an already-existing remote API outside this repo

Treat the project as service-backed when any of these are true:

- the provided project contains both frontend and backend source roots
- a local server process must start with the app for the page to work
- the frontend expects relative `/api` or websocket endpoints that must be served by a local backend
- there is an existing backend build, package, or runtime flow that can be wrapped in `service.js`

If the codebase looks frontend-only but the frontend calls relative `/api` paths with no backend in the provided project, do not silently invent one. Stop and clarify whether the API should stay remote, be mapped to an existing repo service, or be added as a separate integration target.

## Decide Frontend Mode

Use direct core-module integration when:

- the UI should behave like a built-in Punk page
- it can share the existing Vite/router/state conventions
- it does not depend on its own static asset tree or SPA build assumptions
- the project is frontend-only, or the backend is optional or already covered by an existing service

Use `vite/html/<serviceName>` integration when:

- the frontend already has its own bundler and output directory
- the project expects relative `/api` calls or websocket URLs based on `window.location.host`
- keeping the frontend isolated is safer than rewriting it into the core module tree
- the page should open inside the embedded browser as a service page

Prefer the `vite/html/<serviceName>` path when unsure. It preserves original behavior better and matches the current local-service gateway.

If the frontend is integrated into a core module but still needs a private local backend, keep the backend under `services/<serviceName>` and expose only the data boundary to the core page.

For frontend-only projects:

- prefer direct core integration when the page should feel native to the existing Punk module
- prefer `vite/html/<name>` when the page is already a self-contained SPA that should open in the embedded browser
- do not create `services/<serviceName>/service.js` unless a real local backend must be managed
- keep the integration static and avoid unnecessary service-manager coupling

## Split Frontend And Backend

Identify:

- frontend source root, build command, output directory, and base/public path needs
- backend source root, build or packaging command, runtime binary or script, and required env vars
- health endpoint, or the smallest endpoint that can become one
- shutdown method that can terminate the full process tree on Windows and Linux

Do not mass-rewrite the project just to fit Punk Desktop. Preserve API paths, websocket paths, static asset layout, and startup semantics whenever the gateway can absorb the difference.

If the project is frontend-only, explicitly record:

- that no local backend process is required
- whether the frontend depends on a remote API, mock data, or no API at all
- whether the build output can be copied directly into a core module or `vite/html/<name>`
- that service lifecycle, local health checks, backend ports, and gateway proxying are out of scope for this integration

If the project is service-backed, continue with the full service path below.

Record whether the pre-integration gate passed, what commands were used, and what source fixes were required. That baseline becomes the reference point for later regression checks after the project is integrated into Punk.

## Implement Service Integration

For frontend-only projects, skip this entire step. Integrate the frontend page only, keep the existing remote API configuration if one already exists, and do not fabricate a local backend contract.

For service-backed projects, create or update `services/<serviceName>/service.js` with CommonJS exports:

```js
module.exports = {
  meta: {
    name: '<service-name>',
    displayName: '<Display Name>',
    autostart: true,
    pageEntry: 'index.html',
    healthPath: '/apis/health/',
  },
  async build(ctx) {},
  async start(ctx) {},
  async health(ctx) {},
  async stop(ctx) {},
};
```

Implement each method with this contract:

- `build(ctx)`: build backend runtime first, build frontend second, copy frontend output to `vite/html/<serviceName>`, and return `frontendDir` plus only the runtime files needed in packaged builds
- `start(ctx)`: prefer packaged/runtime binary, then repo-built binary, then a development fallback such as `python`, `node`, `java -jar`, or a shell wrapper
- `health(ctx)`: call `http://127.0.0.1:<backendPort><healthPath>` and fail if the payload is not healthy
- `stop(ctx)`: use `ctx.killProcessTree(ctx.processInfo.pid)` after any graceful stop attempt

Follow the current service-manager expectations:

- bind backend to `127.0.0.1`
- let `main/serviceManager.js` own `backendPort` and `gatewayPort`
- rely on the gateway for static hosting, SPA fallback, `/api/*` proxying, and websocket upgrade proxying
- do not hardcode ports in service code
- do not copy the whole source project into packaged output unless it is truly required at runtime

Add or expose a health endpoint in the backend if none exists. A dedicated lightweight health API is required; do not use log scraping or HTML probing as readiness.

## Package Frontend Correctly

For frontend-only projects:

- build the frontend with its native toolchain
- copy the final static assets either into the target core module implementation or into `vite/html/<name>`
- ensure asset URLs, router base, and public path work inside Electron
- if the page opens in the embedded browser, validate that `tableTabManager` treats it as a local html asset only when that is actually desired

If using isolated service hosting, make the frontend build land in `vite/html/<serviceName>` during repo builds and return the same output from `build(ctx)` so `scripts/buildServices.js` can copy it into `dist/services-runtime/<serviceName>/frontend`.

Ensure the frontend can reach the backend without hardcoded remote hosts:

- keep API requests relative, such as `/api/...`
- keep websocket URLs relative to the page host when possible
- prefer gateway compatibility over editing many call sites
- inject build-time env vars only when the project cannot run behind the gateway otherwise

## Wire App Entry

When the integrated project needs a desktop entry or lightApp:

- create or update its app metadata in `src/model/data/appData.js`
- add its desktop icon entry in `vite/packages/table/js/data/desktopData.ts`
- use a package identifier similar to `com.punk.<name>`
- ensure click handling resolves to the service page URL or intended core route

For service pages opened inside the embedded browser:

- open the resolved service URL directly, not a wrapped `html/<url>` path
- verify `src/main/tableTabManager.js` rewrites only true local `.html` assets and leaves `http://127.0.0.1:<gatewayPort>/` untouched
- verify the embedded browser bounds fit the desk/container and do not overflow the visible area
- mirror the opening pattern used by the working Exchange entry when the requirement is "within the desktop in an embedded browser"

If the user wants a standalone app window instead, align with `src/main/appManager.js` window conventions instead of the table-tab flow.

## Validate

Always test the full seam, not just compilation:

- source project validation passed before integration started
- any source-project build or startup errors were fixed and rechecked before code was moved into the main app
- frontend-only integrations load without requiring a local backend process
- frontend-only integrations render `index.html`, static assets, and router paths correctly
- frontend-only integrations still reach their intended remote API, if one exists
- service scan discovers `services/<serviceName>/service.js`
- app startup autostarts the service when `autostart` is true
- health check gates the `running` state
- page open loads `index.html`, static assets, and SPA fallback routes
- frontend `POST /api/...` reaches the backend through the gateway
- websocket endpoints under `/api/ws` or equivalent successfully upgrade
- desktop icon or lightApp opens the expected embedded-browser page
- the resolved URL is not rewritten to `http://localhost:1600/html/http://...`
- closing the main window does not kill the service unless the app truly quits
- app quit stops backend and gateway processes
- packaged builds run from runtime assets without depending on source directories

## Deliverables

Finish with concrete artifacts, not only analysis:

- a short pre-integration validation report with commands run, failures found, and fixes applied
- core-module page integration or static frontend output integration
- service directory and `service.js` only when a local backend exists
- any backend health endpoint additions
- any frontend build-output or path adjustments
- any desktop/icon/app registration changes
- any packaging updates needed for `scripts/buildServices.js` when a managed service exists
- a short validation summary with what was tested and what remains unverified

## Guardrails

Prefer small compatibility shims over large rewrites.
Never bypass source-project errors by integrating first and debugging later.
Prefer binary-first startup with development fallback.
Prefer gateway proxying over hardcoded frontend API host changes.
Preserve existing user-facing behavior and URLs unless the new integration model requires a visible change.
Stop and realign only when the project mixes multiple frontends/backends or when the module choice has non-obvious product consequences.
