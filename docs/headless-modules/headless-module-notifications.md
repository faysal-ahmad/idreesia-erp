# Headless Module Notifications

Headless modules (discussions, DMS, meetings, polls, projects, ...) hold their own data in isolated workspaces. Each of them can tell users about things that happen in those workspaces. Modules publish them to the ERP, which stores them in one place, tracks who has read them, and serves them to clients, for example for the home screen.

This document describes how a module publishes notifications and how the ERP handles them. **No module produces notifications yet.** Each module will be visited separately to decide what it generates (see [Per-module notifications](#per-module-notifications)).

## Contents

- [Overview](#overview)
- [Where things live](#where-things-live)
- [The module contract](#the-module-contract)
- [Publishing notifications](#publishing-notifications)
- [The notification](#the-notification)
- [How the ERP stores notifications](#how-the-erp-stores-notifications)
- [How a user reads notifications](#how-a-user-reads-notifications)
- [The GraphQL API](#the-graphql-api)
- [Guidance for modules](#guidance-for-modules)
- [Testing](#testing)
- [Status and open items](#status-and-open-items)
- [Per-module notifications](#per-module-notifications)

## Overview

```text
  user action in a module     scheduled job in a module
              │                          │
              └────────────┬─────────────┘
                           ▼
              notifier.publish(...) / retire(...)     (provided by the ERP)
                           ▼
                notifications collection              ◄── one collection, owned by the ERP
                           ▲
              read + mark-read (per user)
                           │
                        clients
```

Three decisions shape everything below:

- **Modules push, the ERP owns the lifecycle.** A module publishes a notification when something happens, either on a user action or from its own scheduled job. It never stores read state, never touches the collection, and never talks to clients about notifications.
- **A narrow publisher in between.** Modules use a small ERP-provided object (`publish`, `retire`) and stay isolated from how notifications are stored.
- **One collection, one shape.** Clients read a single collection, so the home screen does not depend on every module being up. Nothing is sent to clients live; they read what is stored.

## Where things live

| Piece | Location |
|---|---|
| Contract (`HeadlessModule`, `ModuleNotification`) | `idreesia-common/server/headless/types.ts` |
| Module registry | `idreesia-common/server/headless/registry.ts` |
| Notifier (publish, retire) and purge | `idreesia-common/server/headless/notifications.ts` |
| Reading and marking read | `idreesia-common/server/headless/user-notifications.ts` |
| Notifications collection | `idreesia-common/server/collections/common/notifications.ts` |
| Schema | `idreesia-common/server/schemas/common/notification.ts` |
| Modules are registered here | `idreesia-common/server/headless/modules.ts` |
| Which notifications a user sees (committees) | `idreesia-common/server/business-logic/hr/committee/notifications.ts` |
| GraphQL API | `idreesia-common/server/graphql-api/workspaces/notifications/` |
| Collection indexes | `idreesia-web/imports/startup/server/migrations/64-create-notifications-indexes.ts` |

## The module contract

Every headless module implements `HeadlessModule`. It is deliberately small. Domain operations (sending a message, uploading a document) are not part of it; each module exposes its own typed API for those. Notifications are not part of it either: a module publishes them through a notifier (see the next section).

```ts
interface HeadlessModule {
  readonly name: string;   // e.g. 'discussions'

  createWorkspace(input: { name; createdBy; metadata? }): Promise<WorkspaceRef>;
  archiveWorkspace(workspace: WorkspaceRef, userId: string): Promise<void>;

  addUser(workspace: WorkspaceRef, userId: string): Promise<void>;
  removeUser(workspace: WorkspaceRef, userId: string): Promise<void>;
}
```

- **Workspaces.** A committee that turns on a feature gets a workspace in that module. The committee stores only the module's opaque `workspaceId`. Data in one workspace is isolated from every other workspace in the module.
- **`addUser` / `removeUser`.** Called when committee membership changes. They must be idempotent. Most modules implement them as no-ops; modules backed by a Rocket.Chat group use them to keep the group's members in step.

A module becomes visible to the ERP by being registered in `headless/modules.ts`. Modules never call each other's functions; shared plumbing (for example the Rocket.Chat conversation functions in `business-logic/rocket-chat/`) lives outside the modules.

## Publishing notifications

A module gets a notifier for itself and uses it wherever the event happens: in the function that handles a user action, or in the module's own scheduled job.

```ts
const notifier = createNotifier('documents');

await notifier.publish({ id, workspaceId, entityType, entityId, eventType, eventDetails, createdAt, ... });
await notifier.retire(id);
```

```ts
interface Notifier {
  publish(notification: ModuleNotification): Promise<void>;
  retire(id: string): Promise<void>;
}
```

- **`publish`** stores the notification. Publishing the same id again updates it (see [How the ERP stores notifications](#how-the-erp-stores-notifications)).
- **`retire`** removes a notification that no longer applies, for example a reminder for a meeting that was cancelled.
- The notifier stamps the module name and keys everything by it, so a module can only publish, update or retire its own notifications.

**Publishing is best effort.** If a publish fails, the module should log the error and carry on. A user's action must not fail because a notification could not be stored. There is no polling to make up for a lost one, so notifications from scheduled jobs should be recomputed and republished on each run, which is safe because republishing unchanged content does nothing.

## The notification

```ts
interface ModuleNotification {
  id: string;                  // unique within the module
  workspaceId: string;
  entityType: string;          // 'document', 'meeting', ... (module-defined)
  entityId: string;            // the thing the event is about
  eventType: string;           // 'document-force-unlocked', ... (module-defined)
  eventDetails: string;        // human-readable description
  createdAt: Date;
  recipientUserId?: string;    // absent = everyone in the committee
  actorUserId?: string;        // who caused it
  data?: Record<string, unknown>;
  expiresAt?: Date;
}
```

| Field | Notes |
|---|---|
| `id` | Unique within the module. Publishing the same id again **updates** the stored notification instead of adding another. See [deterministic ids](#deterministic-ids). |
| `entityType`, `entityId` | What the event is about. The type is a free string, because an id alone is ambiguous inside a module (a DMS document and a DMS folder both have ids). Clients use both to build a link. |
| `eventType` | A string, not an enum, so each module defines its own. |
| `eventDetails` | A readable description. It is a single string in one language. |
| `recipientUserId` | The ERP user it is for. **Absent means everyone in the committee**, so a committee-wide event is one notification, not one per member. |
| `actorUserId` | The ERP user who caused the event. They are never shown their own action. |
| `data` | Optional structured details, for example if a client needs to render its own text. |
| `expiresAt` | After this time the notification is no longer shown. For time-bound notifications such as reminders. |

Recipients and actors are ERP **user ids**, the same ids modules already use (for example a DMS lock holder). The module does not send its own name. The notifier stamps it, and it becomes part of the stored `_id`.

## How the ERP stores notifications

All notifications go into one collection, `common-notifications`. A stored notification is the module's notification plus ERP-owned fields:

| Stored field | Meaning |
|---|---|
| `_id` | `<module>:<module's notification id>`. This is the uniqueness key, so no extra unique index is needed. |
| `module` | The module that reported it. |
| `committeeId` | The committee the notification is for. A module addresses a **workspace**, but the ERP stores only the committee: it finds the committee that holds the module's workspace id (for example `dmsWorkspaceId`) and stores that. The workspace id itself is not stored; nothing beyond this lookup needs it. A module cannot set `committeeId`. A notification for a workspace that no committee owns has nobody to show it to, so it is not stored. |
| `readBy` | Array of user ids who have read it. Used for **every** notification, whether it has a recipient or not. |
| `contentHash` | Hash of the content the module last sent. Used to skip unchanged notifications. |
| `createdAt` | The module's creation time. Never changed afterwards. |
| `updatedAt` | When the ERP last stored a change. Notifications are shown most-recently-changed first. |

### What `publish` does

| Situation | What happens |
|---|---|
| Not stored yet | Inserted with an empty `readBy`. |
| Stored, content **unchanged** | Nothing is written. A notification someone has read stays read. |
| Stored, content **changed** | Content fields are replaced, `updatedAt` is set, and `readBy` is **cleared**, so it shows as unread again. |
| Not stored, already expired | Skipped. |

- **Unchanged is decided by a hash** of the committee, entity, event type, details, recipient, actor, `data` and `expiresAt`.
- **Concurrent publishes.** If two calls insert the same notification, the one that loses its duplicate-key error falls back to an update.

### Purge

`purgeNotifications()` deletes notifications that have expired, and ones not updated for 90 days. The `purge-notifications` scheduled job runs it daily (see [jobs-scheduling.md](../jobs-scheduling.md)).

## How a user reads notifications

`getUserNotifications(userId, scope)` returns what a user can see in the given scope (a list of `{ committeeId, module }`), most recently changed first, each with an `isRead` flag (whether the user is in `readBy`). A notification is visible when **all** of these hold:

- it belongs to one of the given committee and module pairs,
- it is addressed to them (`recipientUserId` equals their id) **or** to everyone (no `recipientUserId`),
- it has not expired,
- the user is not its `actorUserId`.

`markNotificationsRead(userId, scope, ids)` adds the user to `readBy` (`$addToSet`) on those notifications. It applies the same visibility rules, so a user cannot mark what they cannot see. `countUnreadNotifications(userId, scope)` counts the visible ones the user has not read.

**Which committees and modules a user has.** Committee membership is by person, so the ERP goes from the user's `personId` to their committees: `getPersonNotificationScope(personId)` (`business-logic/hr/committee/workspaces.ts`) lists the `{ committeeId, module }` pairs of every committee the person belongs to, for the Discussions, DMS (Documents) and Members features that are enabled. A user with no person (for example `erp-admin`) has none and so sees no notifications.

`business-logic/hr/committee/notifications.ts` ties these together for the logged-in user (`getMyNotifications`, `getMyUnreadNotificationCount`, `markMyNotificationsRead`).

## The GraphQL API

Read and mark-read only; thin resolvers over the functions above. Nothing is pushed to clients.

| Operation | What it does |
|---|---|
| `myNotifications(limit: Int)` | The user's notifications, most recently changed first (default 100). Each has `_id`, `module`, `committeeId`, `entityType`, `entityId`, `eventType`, `eventDetails`, `createdAt`, `updatedAt`, `recipientUserId`, `actorUserId`, `data` (a JSON string) and `isRead`. |
| `myUnreadNotificationCount` | How many visible notifications the user has not read. |
| `markNotificationsRead(ids: [String]!)` | Marks them read for the user. Ids the user cannot see are ignored. |

`committeeId` is the stored one (see above), so a client can navigate to the committee the notification belongs to; it is always set. There is no UI that shows notifications yet.

## Guidance for modules

### Deterministic ids

If a module can produce the same notification again, derive the id from what makes it the same, for example `meeting-reminder:<meetingId>:<date>`. Republishing (for instance when a scheduled job runs again) then updates one notification rather than adding duplicates.

If one notification describes a state that changes, use one stable id and publish the new details each time. Each change shows it as unread again.

### Retiring

When a notification stops applying, call `retire(id)`. This deletes it, read state included. For something that should simply disappear at a known time, set `expiresAt` instead.

### Choosing recipients

- Event for one user: set `recipientUserId`.
- Event for the whole workspace: leave it out. It is stored once and each member's read state is tracked in `readBy`.

### Not everything is a notification

A notification describes something that happened. A live, constantly changing value, such as a user's unread-message count in a chat, is state rather than an event. It is better served by a lookup in the module's own API than by publishing a notification on every change.

## Testing

Unit tests run with Vitest, outside Meteor, against a real in-memory MongoDB:

```
yarn test:unit          # run once
yarn test:unit:watch    # re-run on change
```

- **Setup.** `vitest.config.ts` points `meteor/...` imports at the repository, and the few Meteor packages the code needs (`meteor/mongo`, `meteor/random`, `meteor/meteor`) at small stand-ins in `idreesia-common/server/test-utils/`. The `Mongo.Collection` stand-in runs over the real MongoDB driver, so the production collection classes and their queries and update operators are tested unchanged. Each test file gets its own database, emptied after every test.
- **First run.** `mongodb-memory-server` downloads a `mongod` binary once (network needed the first time; cached afterwards).
- **What is covered.** The notifier (insert, unchanged, changed, expired, retire, module isolation, concurrent publish, purge), reading and marking read (visibility, per-user read state, counts), the committee scope lookup, the GraphQL resolvers, the DMS locks and the DMS notifications (builders, the expiring-lock job, call sites, best-effort publishing), the DMS module wrapper, and the job registry entries.
- **Storage** is replaced by `test-utils/file-storage-mock.ts`, so no object storage is needed.
- **Writing a test for a new module.** Use a fake clock for time-dependent rules (`vi.useFakeTimers({ toFake: ['Date'] })` and `vi.setSystemTime`), and import collections directly (for example `collections/common/notifications`) instead of through a package index, to avoid pulling in unrelated native packages.

## Status and open items

What exists: the contract, the notifier, the collection and schema with indexes, the purge job, the read and mark-read functions, the GraphQL API, and the DMS as the first module that publishes notifications.

- **Only the DMS publishes notifications.** Discussions implements `HeadlessModule` and publishes nothing yet; meetings, polls and projects do not implement it or register with the ERP.
- **No UI shows notifications yet.**
- **Late joiners.** A notification for everyone is visible to anyone who is in the committee later, including notifications from before they joined. Hiding those would need join dates. Not decided.
- **Single language.** `eventDetails` is one string in one language.

## Per-module notifications

To be filled in as each module is reviewed. For each module this section should list the notifications it generates: event type, who receives it, what triggers it, and whether it is event-based or scheduled.

| Module | Notifications |
|---|---|
| Discussions | Not defined yet. Mentions are a candidate (published when a message is sent). Unread counts are not, since they are live state. |
| Documents (DMS) | Four notifications, listed in [dms-design-and-usage.md](dms-design-and-usage.md#notifications): a lock was force-unlocked, a long lock expires soon, a new document, and a new version. |
| Meetings | Not defined yet |
| Polls | Not defined yet |
| Projects | Not defined yet |

## Committee notifications (no workspace)

A committee feature that is not a headless module has no workspace to address. It publishes with `createCommitteeNotifier(name)`, whose `publish` takes a `committeeId` instead of a `workspaceId`; the stored notification is the same, and everything else (ids, `recipientUserId`, `actorUserId`, `expiresAt`, read state) works as for a module. A user sees them when they belong to the committee and the feature is enabled.

The first is **Members** (module `members`, `business-logic/hr/committee/members-notifications.ts`): a person was added to or removed from a committee, or became or stopped being a coordinator. One notification is stored per current member (the affected person reads "You were added...", the others read the person's name); the person who made the change is not notified, and a removed person is not told.
