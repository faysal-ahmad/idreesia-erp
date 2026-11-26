# API Design Guidelines

Conventions for the ERP's server code in `idreesia-common/server`: collections, business logic, the GraphQL API and REST endpoints. Follow them so every module is layered the same way and each piece of logic has one obvious home.

The Workspaces modules (committees, meetings, documents, polls, projects, discussions) are the reference. Some older core modules (inventory, security, outstation, much of HR) still keep logic in their resolvers; don't copy that.

---

## Reference implementation

| Area | Location |
|------|----------|
| Collection (schema + types only) | `idreesia-common/server/collections/common/people.ts` |
| Business logic, one module | `idreesia-common/server/business-logic/polls/` |
| Business logic split per job | `idreesia-common/server/business-logic/common/people/` |
| Search query building | `idreesia-common/server/business-logic/common/people/search-people.ts` |
| Module error helper | `idreesia-common/server/business-logic/polls/errors.ts` |
| Thin resolvers (Workspaces) | `idreesia-common/server/graphql-api/workspaces/polls/resolvers.ts` |
| Access assertions (Workspaces) | `idreesia-common/server/graphql-api/workspaces/polls/access.ts` |
| SDL with permission directives | `idreesia-common/server/graphql-api/inventory/stock-item/stock-item.ts` |
| Directives | `idreesia-common/server/graphql-api/_directives/` |
| Schema and resolver registration | `idreesia-common/server/graphql-api/index.ts` |
| Data loaders | `idreesia-common/server/data-loaders/` |
| REST router (current pattern) | `idreesia-web/imports/startup/server/setup-security-server-endpoints.ts` |
| REST guards (middleware) | `idreesia-web/imports/startup/server/rest-guards.ts` |
| Object storage folders | `idreesia-common/server/file-storage/folders.ts` |
| Business-logic unit tests | `idreesia-common/server/business-logic/common/people/people.test.ts` |
| Headless module design docs | `docs/headless-modules/` |

---

## 1. Layers

| Layer | Location | Holds |
|-------|----------|-------|
| Collections | `server/collections/<module>/` | The collection, its attached schema, document types, data-access plumbing |
| Business logic | `server/business-logic/<module>/` | All domain logic, as plain exported functions |
| GraphQL API | `server/graphql-api/<module>/<entity>/` | SDL, and resolvers that check access and delegate |
| Data loaders | `server/data-loaders/` | Batched loads for nested GraphQL fields |
| REST endpoints | `idreesia-web/imports/startup/server/setup-*-endpoints.ts` | Routes GraphQL can't serve well (file streams, external callers) |

Dependencies point one way: **API → business logic → collections**.

- Business logic never imports from `graphql-api`.
- Collections never import from business logic, and don't import each other.

---

## 2. Collections

A collection file contains only:

- the collection class (usually extending `AggregatableCollection`) with `attachSchema(...)`
- the exported document types (`PersonDocument`, `AppUser`, ...), re-exported from the module's `collections/<module>/index.ts`
- data-access plumbing, such as `aggregate`, a model `transform`, or the `Meteor.users` `aggregate` shim

It contains **no methods**: no create/update/search/validation and no helpers. Those go into business logic.

---

## 3. What counts as business logic

**Business logic** includes:

- validation and integrity rules ("CNIC already in use", "group still has users", "form already approved")
- create/update/delete flows that stamp `createdBy`/`updatedBy`, write audit or security logs, or touch more than one collection
- **search query building**: turning a filter into an aggregation pipeline or selector, plus paging and counting
- mapping a document to the shape callers get (e.g. `mapUser`)
- calls to other systems (chat, object storage, security server)
- CSV import, merging and recalculation jobs

**Not business logic.** A plain read such as `Collection.findOneAsync(id)` or `Collection.find({ ... }).fetchAsync()` may run directly in a resolver. Don't wrap a single find in a business-logic function.

---

## 4. Business logic

- **Plain exported functions**, not classes or collection methods. Example: `createPerson(values, user)`, `searchPeople(params, flags)`.
- **One folder per module** (`admin`, `common`, `hr`, `inventory`, `security`, `outstation`, ...).
- **Files.** Name each file after what it does (`stock-levels.ts`, `visitor-stay-search.ts`). When an entity has a lot of logic, give it a subfolder split by job, as `common/people/` does with `people-mutations.ts`, `person-changes.ts`, `person-uniqueness.ts` and `search-people.ts`.
- **Exports.** Re-export the public functions from the folder's `index.ts`.
- **Imports, avoiding cycles:**
  - Within a module, import sibling files directly (`'./person-images'`), not through the module's `index.ts`.
  - From another business-logic module, import the file's own path when the module index would create a cycle. Example: `business-logic/admin/users` rather than `business-logic/admin`.
- **Function arguments.** Take the acting user as `{ _id }` (`UserRef`), and keep arguments to plain values and ids. Don't pass GraphQL `info` or the resolver context.
- **Errors.** New code throws `GraphQLError` with an `extensions.code` so the API can pass it straight through:
  - `BAD_USER_INPUT`
  - `NOT_FOUND`
  - `FORBIDDEN`
  - `CONFLICT`

  A module defines one helper for this, as `polls/errors.ts` does.
- **Audit and security logs:**
  - For changes to tracked entities, call `createAuditLog` (`business-logic/common/audit-logs.ts`).
  - For account, permission and instance-access changes, insert into `SecurityLogs` with `dataSource` and `dataSourceDetail`.
- **Files.** Store files in object storage under a folder declared in `StorageFolders`, one folder per feature. Don't put new files in the `Attachments` collection. Serve private files through short-lived presigned URLs.
- **Transactions.** See [Transactions](#transactions) below.

### Transactions

Any operation that writes more than one collection, or more than one document that must stay consistent (a record and a counter, a parent and its children), runs in a MongoDB transaction: `runInTransaction` from `server/collections/transactions.ts`.

- **Wrap the whole operation**, reads included, so its checks and its writes see the same data:

  ```ts
  export async function addTaskComment(taskId: string, text: string, userId: string) {
    return runInTransaction(async () => {
      const task = await requireTask(taskId);
      const commentId = await ProjectComments.insertAsync({ ... });
      await ProjectTasks.updateAsync(taskId, { $inc: { commentCount: 1 } });
      await logActivity({ ... });
      ...
    });
  }
  ```

- **The transaction is ambient.** Collection calls made inside it use its session on their own: `insertAsync`, `updateAsync`, `removeAsync`, `findOneAsync`, `find`, `countAsync`, `aggregate` and `rawCollection()` calls, `Meteor.users` and `Accounts` included. Collection2 validation still runs. Reads see the operation's own uncommitted writes.
- **Nesting joins.** A wrapped function called from another one runs in the caller's transaction, so composites (e.g. the committee actions in `admin/committee/`) are atomic as a whole.
- **Effects outside the database** can't be rolled back, and the driver may run the function more than once on transient errors:
  - Deleting files, notifications, and anything else that must only happen once the change is kept: `afterCommit(fn)`. The module notifiers and the `deleteFilesAfterCommit` / `removeAttachments` helpers already do this.
  - Creating something outside (storing a file, a chat group, a chat membership): do it inside the transaction, then register its undo with `onRollback(fn)`. The chat helpers in `business-logic/rocket-chat/chat-group-changes.ts` do this for chat groups.
- **Don't catch a database error inside a transaction and carry on.** The server has already aborted the transaction, so later writes fail. Catching and rethrowing (e.g. a duplicate key turned into `CONFLICT`) is fine.
- **Don't create indexes inside a transaction.** Create them first, as the duty planning functions do with `ensureDutyPlanIndexes()`.
- **Keep transactions short.** A transaction is aborted after 60 seconds. Long jobs and best-effort loops (backfills, imports where each row stands alone) use one transaction per item, or none.
- **Activity logs** written inside a transaction are part of the change: if the log can't be written, the change isn't either.
- MongoDB needs a replica set for transactions. Atlas and Meteor's bundled development database are one; `MONGO_URL` must point at a replica set everywhere else too. The unit tests run on a one-node replica set.

---

## 5. GraphQL API

### File layout

```
graphql-api/<module>/<entity>/
  <entity>.ts     SDL (gql`...`)
  resolvers.ts    resolvers only
```

- Register both in `graphql-api/index.ts`.
- Don't add `queries.ts` or `helpers.ts` beside a resolver. Logic they would hold goes into business logic.
- Workspaces features live under `graphql-api/workspaces/<feature>/`, with an `access.ts` for their access checks.
- Reads of one module's data by other modules live under `graphql-api/reference-data/<entity>/` (see §6, "Reference data"). Query names start with `reference` (`referenceMsDuties`), since field names must be unique across the schema.

### Resolvers

A resolver does three things:

1. checks access (directive or access assertion, see §6)
2. reads arguments and the user from context
3. returns a plain find, or calls one business-logic function

It does **not** insert, update or remove documents, build pipelines, or validate input.

```ts
// Good
deleteHrKarkun: async (obj, { _id }, { user }) => removePerson(_id, user),
hrKarkunById: async (obj, { _id }) => People.findOneAsync(_id),

// Bad: validation and a write in the resolver
createJob: async (obj, values, { user }) => {
  if (await Jobs.findOneAsync({ name: values.name })) throw new Error('...');
  return Jobs.insertAsync({ ...values, createdBy: user._id, ... });
},
```

### Schema conventions

- **Paged results** use `type Paged<Entity> { totalResults: Int, data: [<Entity>] }`, and the query is named `paged<Entities>`. The item array is always called `data`, which is what `@checkPermissions` expects by default.
- **Single and batch lookups** are named `<entity>ById(_id)` and `<entities>ById(_ids)`.
- **Audit fields.** Expose `createdAt`, `createdBy`, `updatedAt` and `updatedBy` on entity types.
- **Nested objects** (`refPhysicalStore`, `karkun`, ...) resolve through data loaders, not one query per row.
- **After any SDL change**, run `yarn codegen` and use the generated types in `idreesia-common/types/`.

### Person picker queries

The UI's person pickers (see the UI design guidelines, Part B §8) all read the same shape, so every query that feeds one:

- is named `paged<Module><Purpose>Karkuns` (or `…People`), lives in the **consumer** module's folder and is gated by the consumer's permission for that use case. A module never picks people through another module's query (`pagedHrKarkuns`, `pagedAdminUserKarkuns`, …).
- takes flat arguments `name`, `cnicNumber`, `phoneNumber`, `pageIndex`, `pageSize`, plus the scope it needs (`locationId`, `committeeId`, …), and returns `PagedPickerPersonType` (`graphql-api/common/person/person.ts`).
- resolves with one business-logic call that states the scope and calls `searchPickerPeople(params, scope)` (`business-logic/common/people/picker-people.ts`). The scope is the `searchPeople` filter and flags that decide who may be listed, e.g. `{ filter: { mehfilLocationId }, flags: { includeKarkuns: true } }`; `markUserAccounts` fills `hasUserAccount`. Use `findMultanCityLocation()` for "karkuns of Multan".

---

## 6. Authorization

- Anonymous callers are refused for every operation by `RequireAuthenticationPlugin`. Everything below is about which logged-in users may do what.
- **A user's access is direct plus group.** `getUser` (`startup/server/get-user.ts`) returns the user with `permissions` merged with those of every group in `users.groups` (`resolveEffectiveAccess`), so `hasOnePermission`, the directives and the REST guards all see group-granted access with no extra code. Store permissions are not part of `permissions`: they are held per store, by users and user groups, in `PhysicalStoreAccess` (see below). Code that must know only a user's *direct* permissions (editing them) re-reads the user from the database instead of using the request user. The `currentUser` query returns the merged values; `userById` returns direct ones. A query that filters users by permission in the database must also look at their groups (see `search-users.ts`).
- **Every mutation must be protected.** Logged-in access is the default, so a field without protection is open to every user. `graphql-api/unprotected-fields.test.ts` fails on any Query or Mutation field with no directive unless it is on that test's `ALLOWED` list, which is the only place to exempt one (with the reason). It checks that protection is declared, not that it is right, and does not cover REST routes (`rest-guards-coverage.test.ts` does, see §7).
- **Core modules** use schema directives:
  - `@checkPermissions(permissions: [...])`. When the user lacks permission, a `paged*` query returns `{ data: [], totalResults: 0 }`, any other query returns `null`, and a mutation throws.
  - `@checkStoreAccess(permissions: [...], physicalStoreIdArgName: "...", returnType: "object" | "list" | "paged-list")` is the Stores module's check: the caller must hold at least one of the `IN_*` permissions *on the store named by the argument*, given to them or to a user group they belong to (`PhysicalStoreAccess`, resolved by `business-logic/inventory/store-access`). It replaces `@checkPermissions` on those fields; the store permissions are not global. `@checkPermissions(..., anyStorePermissions: [...])` additionally lets in anyone holding one of those permissions on any store, for fields that are not about one store (the karkun picker on the store forms).
  - `@superAdminOnly` limits a field to unlocked super-admins. It always throws when denied. Use it where the rule is "super-admin" itself, since super-admin is a flag on the user, not a permission.
  - `@checkCommitteeAccess(roles: [...])` limits a field to people holding one of the given roles on the committee named by the `committeeId` argument (`committeeIdArgName` changes the argument). The roles are `MEMBER`, `COORDINATOR`, `GUEST` and `OBSERVER`, and a super-admin counts as a coordinator. `roles` is required, so every field states its rule. It always throws `FORBIDDEN` when denied, and keeps the loaded committee on the request context for the resolver (`getCommitteeAccess` in `workspaces/committee/access.ts`).
- **Workspaces modules** declare who may call each field with `@checkCommitteeAccess`. Each feature's `access.ts` then checks only what a role cannot tell, and throws `FORBIDDEN` or `NOT_FOUND`: the feature is enabled on the committee, an id belongs to the committee's workspace, and per-item rules such as a guest only seeing the meetings or projects they are in. The roles each feature allows are listed in its document under `docs/headless-modules/`, and a `*-roles.test.ts` next to the feature's schema checks the schema against them.
- **Directives cover permissions only.** A rule that depends on loaded data or the value of an argument (a past-month salary, a document lock, an assignee changing their own task) is business logic and stays in the resolver or business-logic function.
- **Attachments and report routes** check object-level access through `graphql-api/common/attachment/access.ts`, not a directive. An attachment carries no owner, so its category (read from its storage folder) decides the permission, and an attachment of a purchase or issuance form also needs access to the form's store; one not yet on a form is open to its uploader. `/generate-report` checks the store of every form named in the request. New upload categories need an entry in that file's permission table.
- **REST routes** cannot use directives. They use the Express guards in `idreesia-web/imports/startup/server/rest-guards.ts`, which run before the handler like a directive does: `requireLogin`, `requirePermission(...permissions)` (same rule as `@checkPermissions`) and `requireCommitteeDiscussion('read' | 'write')` (the committee-role rule, like `@checkCommitteeAccess`). A guard only calls the shared access helpers; the rules stay there. A rule that depends on request data (the report name and the stores of its forms, an attachment id or category) stays in the handler, through the same helpers as before (`canDownloadReport`, `assertCanViewAttachment`, `decideAttachmentUpload`), behind `requireLogin`.
- **Open by design.** Anyone logged in may read cities, city mehfils and people tags, and the audit/lookup metadata used on every form (`userNames`, `distinctCountries`, `distinctCities`). `distinctCities` feeds filters in Security, Admin, Common and the Workspaces night-stay report, where callers are committee members with no permission, and returns only city names recorded on visitors. Only the mutations of cities, city mehfils and people tags need a permission. Don't add view permissions for them.
- **Everything else a module owns is gated by that module's permissions**, including its setup and lookup lists (`allJobs`, `allDutyLocations`, the mehfil duty, langar dish and langar location reads, `distinctStayAllowedBy`). A query only its own module's screens call stays in the owner's folder with the owner's permissions; it moves to `reference-data/` only when another module needs to read it (below).

### Reference data

Data that one module owns but other modules also read (e.g. HR duties and shifts read by Security and Admin, physical stores read by Purchasing) is not open. Put it in `graphql-api/reference-data/<entity>/`:

- **The owner doesn't use it.** The owning module uses the queries in its own folder, and those carry the owner's permissions (e.g. `allMSDuties` needs the HR permissions). Duplicating the find in `reference-data` is fine.
- **Name it `reference<Entity>`** (`referenceMsDuties`, `referencePhysicalStores`).
- **Gate it with the consumers' permissions.** The `@checkPermissions` list holds the permissions of each use case that reads it, and nothing else. A module that starts using a reference query adds its use-case permission to the directive.
- **Slim types.** Return a dedicated `Reference<Entity>Type` with only what the dropdown or picker needs. No people, committees, contact details or audit fields, and no nested fields that lead to them (see how `DutyType.committee` reached people records).

---

## 7. REST endpoints

Use REST only where GraphQL doesn't fit: binary downloads and uploads, media proxies, and callers outside the ERP such as the security server. New routers follow `setup-workspace-discussion-endpoints.ts` (committee-role routes) or `setup-security-server-endpoints.ts` (permission-gated routes):

- protect every route with a guard from `rest-guards.ts` (`router.use(requireLogin)` or `router.use(requirePermission(Permissions.X))` for the whole router, and a per-route guard such as `requireCommitteeDiscussion('write')` where the rule needs the route's params). Don't write a per-router `authenticate`. A guard puts the user on `req.user`
- use the same permission constants as GraphQL
- return JSON errors with a proper status code (`sendError` in `rest-errors.ts` maps the access helpers' `GraphQLError` codes to HTTP statuses)
- delegate to business logic like a resolver does

`rest-guards-coverage.test.ts` builds the app (`createRestApp` in `setup-rest-endpoints.ts`) and fails for any route with no guard, the REST counterpart of `unprotected-fields.test.ts`. A route that must be open (`/login`, the monitoring config) goes on that test's `ALLOWED` list with the reason. The test checks that a guard is declared, not that it is the right one. A router mounted in `createRestApp` is covered without further changes.

Don't add endpoints in the older ad-hoc style of `setup-rest-endpoints.ts`.

---

## 8. Naming

- Call the Rocket.Chat integration **chat** in identifiers (`createChatUser`, `chatUserId`). Never write `rocketChat` or `RocketChat`.
- The committee group-conversation feature is **discussions**. Rocket.Chat entities keep their Rocket.Chat names (`chatGroupId`).
- Name a business-logic function so it makes sense without its module, e.g. `setUserGroupPermissions`, not `setPermissions`.

---

## 9. Testing

- Unit tests sit next to the business logic as `*.test.ts` and run with `yarn test:unit`.
- They use vitest against an in-memory MongoDB; see `vitest.config.ts` and `server/test-utils/`.
- Mock object storage with `vi.mock('meteor/idreesia-common/server/file-storage', ...)` pointing at `test-utils/file-storage-mock.ts`.
- For an operation in a transaction, test that a failure part-way leaves nothing behind: make its last write fail (e.g. `vi.spyOn(ProjectsActivities, 'insertAsync').mockRejectedValueOnce(...)`) and check the earlier writes were rolled back. See the `transactions.test.ts` files.
- REST guards are tested in `rest-guards.test.ts` (401 / 403 / pass-through with the user lookup mocked); `rest-guards-coverage.test.ts` checks every route has one. When a new route's business logic needs a Meteor-only package, stub it in the coverage test's `vi.mock` list.
- Test validation rules, change detection and search filters through the business-logic functions. Resolvers are thin enough not to need their own tests.

---

## 10. Checklist for a new API feature

1. Collection: schema, document type, and an export from the module index. No methods.
2. Business logic: functions for every write, rule and search, with tests. Operations that write more than one collection or document run in `runInTransaction`.
3. SDL: a paged type with `data`, a permission directive or access check on every operation, then `yarn codegen`. If other modules read the data, give them a `reference*` query in `reference-data/` instead of letting them use the owner's.
4. Resolvers: access check plus a plain find or a single business-logic call.
5. Files, if any: a new `StorageFolders` entry and presigned URLs.
6. Run `yarn typecheck`, `yarn lint` and `yarn test:unit`, then `graphify update .` from the repo root.

---

## Anti-patterns

- Methods on collection classes (`People.searchPeople`, `Users.createUser`).
- Inserts, updates, validation or pipelines in a resolver.
- `queries.ts` or `helpers.ts` files under `graphql-api`.
- Business logic importing from `graphql-api`.
- A module reading another module's data through an ungated query, or through the owner's query with a permission that module's users don't hold. Add a `reference*` query instead.
- An owning module using its own `reference*` queries.
- Nested fields on a reference type that reach people or other sensitive records.
- Wrapping a single `findOneAsync` in a business-logic function.
- A mutation with no permission directive or access assertion.
- New files stored in the `Attachments` collection.
- Collections importing other collections or business logic.
- Writing several collections, or a record and its counter, outside `runInTransaction`.
- Deleting files, sending notifications or archiving chat inside a transaction without `afterCommit` (or creating them without `onRollback`).
