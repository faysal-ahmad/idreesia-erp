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
- **Nesting joins.** A wrapped function called from another one runs in the caller's transaction, so composites (e.g. the committee actions in `hr/committee/`) are atomic as a whole.
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

---

## 6. Authorization

- Anonymous callers are refused for every operation by `RequireAuthenticationPlugin`. Everything below is about which logged-in users may do what.
- **Every mutation must be protected.** Logged-in access is the default, so a field without protection is open to every user.
- **Core modules** use schema directives:
  - `@checkPermissions(permissions: [...])`. When the user lacks permission, a `paged*` query returns `{ data: [], totalResults: 0 }`, any other query returns `null`, and a mutation throws.
  - `@checkInstanceAccess(instanceIdArgName: "...", returnType: "object" | "list" | "paged-list")` restricts access to the instances the user may see, such as physical stores.
- **Workspaces modules** assert access at the top of each resolver through their `access.ts` (committee membership, feature enabled, coordinator role). These checks throw `FORBIDDEN` or `NOT_FOUND`.
- **Reference data reads are open by design.** Anyone logged in may read cities, mehfils and people tags; only their mutations need a permission. Don't add view permissions for them.

---

## 7. REST endpoints

Use REST only where GraphQL doesn't fit: binary downloads and uploads, media proxies, and callers outside the ERP such as the security server. New routers follow `setup-security-server-endpoints.ts`:

- authenticate with the login token
- check permissions with the same permission constants as GraphQL
- return JSON errors with a proper status code
- delegate to business logic like a resolver does

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
- Test validation rules, change detection and search filters through the business-logic functions. Resolvers are thin enough not to need their own tests.

---

## 10. Checklist for a new API feature

1. Collection: schema, document type, and an export from the module index. No methods.
2. Business logic: functions for every write, rule and search, with tests. Operations that write more than one collection or document run in `runInTransaction`.
3. SDL: a paged type with `data`, a permission directive or access check on every operation, then `yarn codegen`.
4. Resolvers: access check plus a plain find or a single business-logic call.
5. Files, if any: a new `StorageFolders` entry and presigned URLs.
6. Run `yarn typecheck`, `yarn lint` and `yarn test:unit`, then `graphify update .` from the repo root.

---

## Anti-patterns

- Methods on collection classes (`People.searchPeople`, `Users.createUser`).
- Inserts, updates, validation or pipelines in a resolver.
- `queries.ts` or `helpers.ts` files under `graphql-api`.
- Business logic importing from `graphql-api`.
- Wrapping a single `findOneAsync` in a business-logic function.
- A mutation with no permission directive or access assertion.
- New files stored in the `Attachments` collection.
- Collections importing other collections or business logic.
- Writing several collections, or a record and its counter, outside `runInTransaction`.
- Deleting files, sending notifications or archiving chat inside a transaction without `afterCommit` (or creating them without `onRollback`).
