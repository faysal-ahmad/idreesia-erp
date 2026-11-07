# APM Setup and Integration (New Relic)

How error monitoring through New Relic is wired into the ERP (`idreesia-web`), how local and production data are kept apart, and how to set it up and test it.

Scope: the ERP only (the Meteor server and the browser client). `idreesia-mobile` and the security server are not covered.

---

## Overview

| Side | What reports | How |
|------|--------------|-----|
| Server | GraphQL resolver errors, security-server REST failures, failed agenda jobs | `newrelic` Node agent (APM) |
| Browser | React render errors, Apollo network failures, uncaught JS errors | `@newrelic/browser-agent` |

Both are **off unless explicitly enabled**, and they never start if `ENVIRONMENT` is missing or invalid.

---

## Environments and data separation

`ENVIRONMENT` is the single switch for which environment a process runs in: `local` or `production`.

The New Relic app name is built from it, so each environment reports to its own app and data never mixes:

| Process | App name |
|---------|----------|
| Web (local) | `Idreesia ERP (local)` |
| Web (production) | `Idreesia ERP (production)` |
| Jobs process (local) | `Idreesia ERP Jobs (local)` |
| Jobs process (production) | `Idreesia ERP Jobs (production)` |

The jobs process is the one running with `WEB_SERVER_ENABLED=false` (see `ecosystem.config.js`).

The browser agent has no app-name setting; the app is identified by its application ID. So there is one **browser app per environment** in New Relic (`Idreesia ERP Web (local)` / `Idreesia ERP Web (production)`), each with its own IDs, and every event is also tagged with an `environment` attribute.

---

## Environment variables

Set locally in `idreesia-web/.env` (gitignored; template in `idreesia-web/.env.example`). In production they are DigitalOcean App Platform environment variables.

| Variable | Purpose |
|----------|---------|
| `ENVIRONMENT` | `local` or `production`. Appended to the app name. |
| `NEW_RELIC_ENABLED` | `true` to start monitoring. Defaults to `false` in `.env.example`. |
| `NEW_RELIC_LICENSE_KEY` | APM license key (key type **Ingest - License**). |
| `NEW_RELIC_BROWSER_ACCOUNT_ID` | Browser agent `accountID`. |
| `NEW_RELIC_BROWSER_TRUST_KEY` | Browser agent `trustKey`. |
| `NEW_RELIC_BROWSER_AGENT_ID` | Browser agent `agentID`. |
| `NEW_RELIC_BROWSER_LICENSE_KEY` | Browser license key (starts with `NRJS-`). Not the same as the APM key. |
| `NEW_RELIC_BROWSER_APPLICATION_ID` | Browser agent `applicationID`. |

`NEW_RELIC_APP_NAME` and `NEW_RELIC_NO_CONFIG_FILE` are set by the code at startup; do not set them by hand.

The browser identifiers are public values (they ship in every page that uses the agent), not secrets. The APM license key is a secret.

---

## Server integration

All server logic lives in `idreesia-web/imports/startup/server/newrelic.ts`.

- **Startup:** `index.ts` calls `initNewRelic()` right after dotenv loads `.env`. It does nothing unless `NEW_RELIC_ENABLED=true`, `ENVIRONMENT` is valid, and `NEW_RELIC_LICENSE_KEY` is set (otherwise it logs a warning). On success it sets `NEW_RELIC_APP_NAME`, then `require('newrelic')`, and logs `[newrelic] reporting as "<app name>"`.
- **`noticeError(error, attributes)`:** reports an error with an `environment` attribute; a no-op when monitoring is off.
- **Where errors are reported:**
  - GraphQL resolver errors, in `apollo-error-formatter.ts`. Expected user-facing codes (`UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`, validation/parse failures) are skipped to avoid noise.
  - Security-server REST failures (the 500 branch of `handle` in `setup-security-server-endpoints.ts`).
  - Failed background jobs (`agenda.on('fail')` in `setup-agenda.ts`).
- **Uncaught exceptions:** captured by the New Relic agent itself. We deliberately do not add our own `process.on('uncaughtException' | 'unhandledRejection')` listeners, because that would stop Node from crashing on them.
- **Browser config endpoint:** `GET /api/monitoring-config` (in `setup-rest-endpoints.ts`) returns the browser identifiers from env, or `204` when monitoring is disabled. The client cannot read `process.env`, so it fetches this at startup.

### Node / Meteor version note

`newrelic` 14.x crashed Meteor 3.5.0's bundled Node (24.15.0) on startup with `Assertion failed: (next_channel_index_) < (kMaxChannels)`, because the agent registers many Node diagnostics channels. It works on Meteor 3.5.4 (Node 24.22.1). If you ever see that assertion again after a Meteor or Node change, pin `newrelic` to `12.25.1`, which does not use diagnostics channels.

### Agent limits

The agent is loaded inside the app (after `.env`), not with `NODE_OPTIONS=-r newrelic`, so auto-instrumentation of http/Mongo may be limited. Error reporting works regardless. The agent writes `newrelic_agent.log` next to the Meteor server bundle (gitignored in dev).

---

## Browser integration

- **`idreesia-web/imports/ui/monitoring.ts`:**
  - `initMonitoring()` fetches `/api/monitoring-config`; on `204` it does nothing. Otherwise it creates the `BrowserAgent` and sets the `environment` custom attribute. It runs asynchronously and never delays first render.
  - `reportError(error, attributes)` reports an error, queuing up to 20 until the agent has loaded.
  - Meteor's resolver does not honor package.json `exports` subpaths, so the loader is imported by its on-disk path: `@newrelic/browser-agent/dist/esm/loaders/browser-agent`.
- **Wiring in `client/main.tsx`:** `initMonitoring()` is called at startup. A top-level `ErrorBoundary` around `<App />` reports with `source: 'app-root'`. An Apollo `ErrorLink` reports network failures with `source: 'apollo-network'` (GraphQL errors are skipped because the server already reports them).
- **`imports/ui/main-layout/main-content.tsx`:** the module-router `ErrorBoundary` reports with `source: 'module-router'`.
- The agent captures uncaught JS errors and unhandled promise rejections on its own.

---

## Setting up New Relic (US region)

The account is in the US region: UI at `one.newrelic.com`, and the defaults (collector, `bam.nr-data.net`) are correct. For an EU account the browser beacon would be `bam.eu01.nr-data.net`.

### 1. APM license keys

1. Open `one.newrelic.com/api-keys` → **Create a key**.
2. Key type **Ingest - License**. Name it `idreesia-erp-local`; repeat later for `idreesia-erp-production`.
3. Copy the value immediately. New Relic no longer offers "Copy key" afterwards, and license keys cannot be renamed in the UI.

### 2. Browser apps (one per environment)

1. **Integrations & Agents → Browser and mobile → Browser monitoring → Get your browser snippet**, choose the **npm** option.
2. Name it `Idreesia ERP Web (local)` (later `... (production)`).
3. From the generated snippet copy `accountID`, `trustKey`, `agentID`, `licenseKey`, and `applicationID` into the five `NEW_RELIC_BROWSER_*` variables. Do not paste the snippet into the code; the app loads the agent itself.

### 3. Local `.env`

```
ENVIRONMENT=local
NEW_RELIC_ENABLED=true
NEW_RELIC_LICENSE_KEY=...
NEW_RELIC_BROWSER_ACCOUNT_ID=...
NEW_RELIC_BROWSER_TRUST_KEY=...
NEW_RELIC_BROWSER_AGENT_ID=...
NEW_RELIC_BROWSER_LICENSE_KEY=...
NEW_RELIC_BROWSER_APPLICATION_ID=...
```

### 4. Production (DigitalOcean App Platform)

Set the same variables with `ENVIRONMENT=production`, the production APM key, and the IDs of the **production** browser app.

---

## Verifying locally

1. Start the app and look for `[newrelic] reporting as "Idreesia ERP (local)"` in the server log. If instead you see `ENVIRONMENT must be 'local' or 'production'` or a missing-key warning, monitoring is off.
2. `GET /api/monitoring-config` should return `200` with the local identifiers (or `204` when disabled).
3. **Backend:** cause a GraphQL error that is not an auth/validation failure, then check **APM & services → Idreesia ERP (local) → Errors inbox**. It can take 1-2 minutes.
4. **Browser:** run `setTimeout(() => { throw new Error('nr-browser-test') })` in the browser console, then check **Browser → Idreesia ERP Web (local) → JS errors**.
5. Confirm nothing shows up under the production apps. With `NEW_RELIC_ENABLED=false`, no requests to `bam.nr-data.net` should be made.

---

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Server crashes on startup with `kMaxChannels` assertion | Meteor's bundled Node is too old for `newrelic` 14 (needs 3.5.4 / Node 24.22.1+); upgrade Meteor or pin `newrelic` to `12.25.1`. |
| `New Relic is disabled` warning at startup | `ENVIRONMENT` is not `local`/`production`, or `NEW_RELIC_LICENSE_KEY` is empty. |
| `/api/monitoring-config` returns 204 | Monitoring is off, or one of the five browser variables is empty. |
| No data in New Relic | Check the agent log (`newrelic_agent.log`) for `Connected to collector.newrelic.com`; confirm the license key is type **Ingest - License** and the region is US. |
| Browser agent fails to load | The loader is imported by its on-disk `dist/esm` path because Meteor ignores `exports` subpaths; check the browser console for a module resolution error. |
