# Job Scheduling

Background job scheduling and recurring/manual job execution for idreesia-erp, built on [Agenda](https://www.npmjs.com/package/agenda) (a MongoDB-backed job scheduler) rather than a Redis-backed queue, since the stack has MongoDB but no Redis.

## Overview

idreesia-erp needs recurring work (e.g. generating monthly attendance and salary records) to run on a schedule without a human clicking a button, plus a way for admins to see what ran, retry failures, and adjust schedules without a code deploy.

The feature is split into two related but distinct concepts:

- **Job Definitions** — the catalog of job *types* the system knows about (e.g. "Create Monthly Attendance"), each with a display name, an optional recurring schedule, and an enabled/disabled flag. This is app-owned data, persisted in its own collection and editable by admins.
- **Job Instances** — the actual scheduled/queued/running/completed/failed job documents that Agenda itself manages. A single Job Definition with a recurring schedule produces a stream of Job Instances over time (one per run); Run Now produces a single one-off instance.

A Job Definition can be:

- **Recurring** — has a cron schedule; Agenda creates and re-runs a job instance on that schedule automatically.
- **Manual only** — has no schedule at all; the only way to run it is the "Run Now" action. This is a deliberate first-class state, not a side effect of disabling a schedule.

Three admin pages expose this, all under **Admin → Scheduled Jobs**:

- **Job Definitions** — the catalog: edit a job's recurring schedule (or clear it back to manual-only, or reset it to the code-defined default), enable/disable a recurring schedule, and trigger Run Now.
- **Jobs Dashboard** — the live/historical list of job *instances* with their status (scheduled, running, queued, completed, failed, repeating, paused), timestamps, and failure reason; supports Retry (for failed instances) and Enable/Disable (for recurring instances).
- **Job Logs** — Agenda's built-in per-event log (start/success/fail/retry) for every job instance, for troubleshooting.

Jobs whose handlers need to record "who did this" (e.g. attendance/salary records normally stamped with the acting user) use a dedicated, passwordless service account, `erp-system`, rather than attributing scheduled runs to a real person.

Whether the job *processor* runs at all (i.e. whether anything actually executes on schedule) is gated by `Meteor.settings.private.jobs.enabled`. This exists so recurring jobs don't fire unexpectedly in every local/dev environment; the Job Definitions/Dashboard pages themselves are usable either way, and clearly indicate when the processor is off so an admin doesn't assume a queued job silently failed.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ Meteor.startup()  →  setupAgenda()                                  │
│                                                                       │
│   1. setupJobDefinitions()          (always runs)                    │
│        - agenda.define(name, handler) for every registry entry       │
│        - seeds JobDefinitions (insert-only-if-missing)               │
│        - prunes JobDefinitions/agenda jobs no longer in the registry │
│                                                                       │
│   2. if settings.private.jobs.enabled:                               │
│        - agenda.start()             (starts the polling processor)   │
│        - scheduleRecurringJobs()    (agenda.every() per definition)  │
│        - SIGTERM/SIGINT → agenda.stop()                              │
└─────────────────────────────────────────────────────────────────────┘
```

Two sources of truth, deliberately kept separate:

- **`JOB_DEFINITIONS_REGISTRY`** (code, `job-definitions-registry.ts`) — the only place a job *type* is declared: its name, display name, default schedule, and handler function. This is what you edit to add a new job. It is never edited by the running app.
- **`JobDefinitions` collection** (MongoDB) — the *configurable* state per job type: the currently-active schedule (which may differ from the registry's default if an admin changed it) and the enabled flag. Seeded from the registry on boot, but never overwritten once a row exists — an admin's schedule edit survives every redeploy.

`scheduleRecurringJobs()` reads *only* from the `JobDefinitions` collection (never the registry) when deciding what to actually register with Agenda via `agenda.every()`. This is what makes a UI schedule edit durable across restarts, and what makes "no schedule" (manual-only) mean the definition is simply skipped here — nothing is registered for it at all.

Agenda itself owns two MongoDB collections, configured via `@agendajs/mongo-backend` (Agenda 6.x moved MongoDB support out of the `agenda` package itself and into this separate backend package):

- **`agenda-jobs`** — every job instance (scheduled, queued, running, completed, failed, repeating).
- **`agenda-job-logs`** — Agenda's built-in per-event log, enabled via `logging: true` on the `Agenda` instance.

There is deliberately **no custom collection wrapping Agenda's job storage** — `agenda.queryJobs()` already returns jobs with a computed `state`, and handles sorting/pagination itself, so the `pagedScheduledJobs` resolver calls it directly instead of maintaining a parallel read model.

### GraphQL surface

Two separate modules, mirroring the Job Definition / Job Instance split above:

- **`admin/scheduled-job`** — operates on job *instances*: `pagedScheduledJobs`, `pagedJobLogs`, `isJobProcessorActive` queries; `runScheduledJobNow`, `retryFailedJob`, `setScheduledJobEnabled` mutations.
- **`admin/job-definition`** — operates on job *definitions*: `allJobDefinitions` query; `updateJobDefinitionSchedule`, `clearJobDefinitionSchedule`, `resetJobDefinitionSchedule`, `setJobDefinitionEnabled` mutations.

Both are gated by the `ADMIN_VIEW_JOBS` / `ADMIN_MANAGE_JOBS` permissions via the standard `@checkPermissions` directive, and every mutation writes an audit log entry (`EntityType.SCHEDULED_JOB` / `EntityType.JOB_DEFINITION`).

### Why Agenda, not a Redis-backed queue

BullMQ (the more widely-used choice by download volume) is fundamentally Redis-based; as of its own pluggable-backend release it added Postgres support but still has no MongoDB backend. Since idreesia-erp is a MongoDB shop with no Redis dependency, Agenda was the only mainstream option that fit without adding new infrastructure.

## Creating Job Definitions

Adding a new job type end-to-end is intentionally a one-file change — no migration, no GraphQL change, no UI change. At a high level:

1. **Write the job's logic as an async handler function.** This is regular application code — typically alongside whatever business logic it's automating (e.g. the existing `create-monthly-attendance`/`create-monthly-salaries` handlers call into the same business-logic functions the manual UI buttons used to call). If the handler needs to record "who did this" for an audited record, use `getSystemUser()` (`idreesia-common/server/business-logic/jobs/system-user.ts`) to get the `erp-system` service account rather than inventing a new pattern.
2. **Register it as a new entry in the job definitions registry**, `idreesia-common/server/business-logic/jobs/job-definitions-registry.ts`. Each entry needs a unique `name`, a human-readable `displayName`, the handler from step 1, and — only if the job should run on a recurring schedule out of the box — a `defaultSchedule` cron expression. Omitting `defaultSchedule` makes it manual-only by default; an admin can still give it a recurring schedule later from the Job Definitions page.
3. **Deploy.** On the next server boot, `setupJobDefinitions()` (`idreesia-common/server/business-logic/jobs/setup-job-definitions.ts`, invoked from `setupAgenda()` in `idreesia-web/imports/startup/server/setup-agenda.ts`) automatically registers the handler with Agenda and seeds a corresponding row into the `JobDefinitions` collection if one doesn't already exist. Nothing else needs to run this step manually.
4. **That's it — the system already knows how to manage it.** The existing `admin/job-definition` and `admin/scheduled-job` GraphQL modules and the Job Definitions / Jobs Dashboard / Job Logs pages all operate generically over whatever is in the `JobDefinitions` collection and Agenda's own job store; the new job simply appears there with no code changes to any of them. If it has a `defaultSchedule`, `scheduleRecurringJobs()` picks it up and registers it as recurring once `jobs.enabled` is true; either way, it's immediately available for Run Now from the Job Definitions page.

Removing a job definition later is symmetric: delete its entry from the registry and deploy. The same startup step notices the name is gone, cancels every scheduled/queued instance of it, and removes its `JobDefinitions` row automatically.
