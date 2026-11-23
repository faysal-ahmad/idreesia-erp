# Purchasing Module: Technical Design

Audience: developers and maintainers. End users should read the [user manual](user-manual.md).

The Purchasing module (menu: **381-A Operations > Purchasing**) covers the whole cycle from asking for something to paying for it: requisition, approval, optional quotes, purchase order, goods receipt, vendor invoice, payment, and reports.

It is **independent of Stores**. It has its own vendors and item catalog, never changes stock, and uses no Stores code, data or permission. Stores' purchase forms are untouched.

## Contents

- [Design principles](#design-principles)
- [The cycle and document states](#the-cycle-and-document-states)
- [Data model](#data-model)
- [Business rules](#business-rules)
- [Permissions](#permissions)
- [GraphQL API](#graphql-api)
- [Attachments](#attachments)
- [Reports and Excel export](#reports-and-excel-export)
- [Web UI](#web-ui)
- [Migration and indexes](#migration-and-indexes)
- [Testing](#testing)
- [Where things live](#where-things-live)
- [Known limitations](#known-limitations)

## Design principles

1. **Independent of Stores.** Own collections (`purchasing-*`), own vendors, own catalog. No imports from Stores code.
2. **Permissions decide who; business logic decides what is valid.** Business logic enforces data integrity only (legal state transitions, quantity and amount limits, uniqueness). It never contains a "who" rule such as "the creator cannot approve". Duties are separated by assigning permissions to different users and groups. This is a deliberate decision; do not add hard-coded role rules.
3. **Free text first, catalog optional.** Every line can be typed freely. A catalog item is an optional convenience that grows over time.
4. **Snapshots, not live references.** Line description and unit are copied onto each document, so catalog edits never rewrite history.
5. **Layering follows `docs/api-design-guidelines.md`.** Collections, then business logic (plain functions, throw `GraphQLError`), then thin resolvers that only check access and delegate.

## The cycle and document states

```
Requisition ──approve──▶ Quotes (optional) ──select──▶ Purchase order ──approve──▶ send
                                                              │
                                              Goods receipt(s) ◀┘ (partial deliveries)
                                                              │
                                                  Vendor invoice(s) ──▶ Payment(s)
```

| Document | Number | Statuses |
|---|---|---|
| Requisition | `PR-<year>-<seq>` | `draft` → `submitted` → `approved` / `rejected`; `ordered` once an order is made from it; `cancelled`. A rejected one can be reopened as a draft. |
| Quote | none | `received` → `selected` / `rejected`. Selecting one rejects the other open quotes of the same requisition. |
| Purchase order | `PO-…` | `draft` → `pending-approval` → `approved` → `sent` → `partially-received` → `received` → `closed`; `cancelled`. Approval can send it back to `draft` with a reason. |
| Goods receipt | `GRN-…` | `posted` / `voided` |
| Invoice | `INV-…` | `unpaid` → `partially-paid` → `paid`; `voided`. `isDisputed` is a separate flag, not a status. |
| Payment | `PAY-…` | `posted` / `voided` |

Orders can be made by hand, from an approved requisition (vendor chosen, lines copied) or from a quote.

## Data model

All collections extend `AggregatableCollection` with SimpleSchema and the `identifiable` + `timestamps` mixins. Schemas are in `idreesia-common/server/schemas/purchasing/`, collections in `…/collections/purchasing/`. See the [ER diagram](../mongodb-er-diagram.md#purchasing).

| Collection | Notes |
|---|---|
| `purchasing-vendors` | name, contact, phone, email, address, tax id, payment terms (days), bank details, notes, `isActive`. |
| `purchasing-catalog-items` | name (unique, case-insensitive), unit, category, default price, last price and last vendor (set when an order is approved), `isActive`. |
| `purchasing-requisitions` | number, title, purpose, requester, needed-by date, lines, estimated total, status, submit/approve/reject audit fields, `version`. |
| `purchasing-quotes` | vendor, optional requisition, quote and valid-until dates, lines, total, status. |
| `purchasing-orders` | number, vendor, optional requisition and quote, dates, delivery address, payment terms, lines (with `receivedQuantity` and `invoicedQuantity`), subtotal, tax, discount, shipping, total, status, approval fields, `version`. |
| `purchasing-receipts` | number, order, vendor, received date and by, delivery note, lines `{orderLineId, receivedQuantity, rejectedQuantity, remarks}`, status. |
| `purchasing-invoices` | number, vendor invoice no (unique per vendor), vendor, optional order, dates, lines, total, `paidAmount`, status, `isDisputed`. |
| `purchasing-payments` | number, vendor, date, method (`cash` / `bank-transfer` / `cheque`), reference, amount, `allocations[{invoiceId, amount}]`, status. |
| `purchasing-counters` | `{type, year, seq}`, atomic `$inc` for numbering. |
| `purchasing-attachments` | owner type and id, storage key, sha256, size, mime type, status. |

A **line** (shared schema `schemas/purchasing/lines.ts`) has `_id`, optional `catalogItemId`, `description`, `unit`, `quantity`, and where it applies a price and tax rate. Money is rounded to two decimals, quantities to three (`roundMoney`, `roundQuantity` in `internal.ts`). Single currency.

## Business rules

Code: `idreesia-common/server/business-logic/purchasing/`, one file per document, tests beside them. Functions take the acting user's `_id`, throw `GraphQLError` (`BAD_USER_INPUT`, `NOT_FOUND`, `CONFLICT`) through `errors.ts`, and write an audit log for every change. Multi-document writes use `runInTransaction`.

Shared helpers in `internal.ts`: `roundMoney`, `normalizeBaseLine`, `totalsOf`, `updateIfUnchanged`, `moveStatus`, `parseDateInput`, `audit`.

**Concurrency**
- Edits carry the document's `version`. `updateIfUnchanged` bumps it and fails with `CONFLICT` when stale.
- Status changes (`moveStatus`) are conditional updates (`status: { $in: allowedFrom }`), so two people acting at once cannot both succeed.

**Numbering.** `numbering.ts` does a `findOneAndUpdate` with `$inc` on `purchasing-counters` inside the ambient Mongo session of the creating transaction. A failed save therefore rolls the counter back and leaves no gap. Numbers restart each year.

**Documents**
- Only drafts are edited. An approved order's lines are locked; to change one, cancel it and make a new one.
- **Receipt:** posting adds accepted quantities to the order lines and moves the order status (`approved`/`sent` → `partially-received` → `received`) in one transaction. Receiving more than ordered is refused. Voiding puts the quantities back, unless an invoice already bills them.
- **Invoice:** one linked to an order can bill at most what was received and not yet invoiced. Billing more is refused unless the caller passes the accept flag, which sets `isDisputed`. The vendor invoice number is unique per vendor.
- **Payment:** pays one vendor's invoices. Each allocation is at most what is still owed, and allocations sum to the amount. Invoice `paidAmount` and status change in the same transaction. Voiding reverses it.
- An order with receipts or invoices cannot be cancelled; void those first.
- A vendor or catalog item referenced by any document cannot be deleted, only deactivated. Inactive vendors are rejected on new documents.
- Approving an order stores price and vendor on each catalog-linked line's item as its last purchase.
- `createCatalogItemFromLine` copies a line into the catalog, links the line, and blocks a near-duplicate name case-insensitively.

## Permissions

18 permissions, strings prefixed `purchasing-` (the header shows the module to anyone with at least one, through `isModuleAccessible`). Defined in `constants/permissions.ts`, mirrored in the `Permission` enum in `graphql-api/_directives/permission.ts`, and listed in the Admin permission picker through `PurchasingPermissionsData` (`access-management/permissions-data.ts`).

| Permission | Allows |
|---|---|
| `purchasing-view-vendors` / `-manage-vendors` | See / change vendors |
| `purchasing-manage-catalog` | Change the catalog (any document permission can pick from it) |
| `purchasing-view-requisitions` / `-manage-requisitions` / `-approve-requisitions` | See / create, edit, submit, cancel / approve, reject |
| `purchasing-view-orders` / `-manage-orders` / `-approve-orders` | See / create and edit orders and quotes, send, cancel, close / approve, return to draft |
| `purchasing-view-receipts` / `-manage-receipts` | See / post and void receipts |
| `purchasing-view-invoices` / `-manage-invoices` | See / enter, edit, dispute, void invoices |
| `purchasing-view-payments` / `-manage-payments` | See / post and void payments |
| `purchasing-view-reports` | Dashboard figures, reports, Excel downloads |
| `purchasing-view-audit-logs` | The Audit Logs page and the History tab of every document |
| `purchasing-manage-permissions` | The Permissions page: see who holds each Purchasing permission, add and remove users (one permission covers both viewing and changing) |

Every workflow action maps to exactly one permission. Super admins receive all permissions automatically; everyone else is granted them in Admin (no seed migration).

Enforcement is in three places:
1. `@checkPermissions` on every Query and Mutation (the real check; the authorization-matrix snapshot test fails on anything unprotected).
2. `/generate-report` Purchasing entries in `rest-api/report-access.ts`, gated by `purchasing-view-reports`.
3. Attachments are checked against the document they belong to (`graphql-api/purchasing/attachment/access.ts`: an invoice's files need an invoice permission).

The UI hides buttons with the same permissions through `common/use-purchasing-access.ts`, for convenience only.

### Permissions page

The page (`permissions/`) has two tabs, URL-synced with `?tab=`: **Permissions** and **User Groups**. Both are gated by `PURCHASING_MANAGE_PERMISSIONS` only, for viewing and changing.

**Permissions tab** (`business-logic/purchasing/permissions.ts`, `graphql-api/purchasing/permission/`). The list shown is `PurchasingPermissionCatalog` in `constants/purchasing.ts` (keep it in step with `PurchasingPermissionsData` in the Admin picker when adding permissions).
- `purchasingPermissionAssignments` lists each permission with the users who hold it directly (`users.permissions`). Locked accounts and super admins (who hold everything implicitly) are left out.
- Each permission also lists the Purchasing user groups that hold it (`UserGroups.permissions`). `addPurchasingPermissionGroup` / `removePurchasingPermissionGroup(permissionKey, groupId)` `$addToSet` / `$pull` it on the group (Purchasing groups only) and write a `PERMISSIONS_CHANGED` security log with `groupId`. This is data only: see "Groups do not grant access" below.
- `purchasingKarkunSearch` feeds the Add User drawer, which is the same karkun picker the Mehfil Permissions page uses (`KarkunSelectionList`). It lists karkuns whose `cityLocationId` is the city location named `PURCHASING_KARKUN_CITY` (`Multan`, matched by name, ignoring case; `constants/purchasing.ts`) and who have a user account. Nobody is listed if that city location does not exist.
- `addPurchasingPermissionUser(permissionKey, karkunId)` resolves the karkun's user account (`users.personId`), refusing a karkun without one, a locked account and a super admin. `removePurchasingPermissionUser(permissionKey, userId)` takes it away. Both `$addToSet` / `$pull` the permission on the user and write a `PERMISSIONS_CHANGED` security log (data source `operations`), the same record the Admin permissions form writes. Only Purchasing permissions can be changed this way.

**User Groups tab** (`business-logic/purchasing/user-groups.ts`, `graphql-api/purchasing/user-group/`). Purchasing's groups are rows of the shared `user-groups` collection with `moduleName = ModuleNames.purchasing`; membership is the group id in the user's `groups` array. Operations: `purchasingUserGroups`, `create/update/deletePurchasingUserGroup`, `addPurchasingGroupMember(groupId, karkunId)` and `removePurchasingGroupMember(groupId, userId)`. The Add User drawer is the same karkun picker (`purchasingKarkunSearch`). Names are unique across all groups, ignoring case; a group with members cannot be deleted; groups of other modules cannot be touched through these operations.

**Groups do not grant access.** Permission checks (`hasOnePermission`, and the logged-in user's permission list) read only `users.permissions`. Neither a group's `permissions` nor `users.groups` is applied anywhere in the app, so Purchasing groups only organise users for now, even when a permission is assigned to a group on the Permissions tab. Making groups effective would change permission resolution for every module and was deliberately left out.

All operations are gated by `PURCHASING_MANAGE_PERMISSIONS`. As elsewhere, there is no "who" rule: a holder can change their own permissions.

## GraphQL API

`idreesia-common/server/graphql-api/purchasing/<entity>/{<entity>.ts, resolvers.ts}` for: vendor, catalog-item, requisition, quote, order, receipt, invoice, payment, report, audit-log, attachment. Registered in `graphql-api/index.ts`.

- Lists are `pagedPurchasing<Entities>` returning `{ totalResults, data }`; single records are `purchasing<Entity>ById`.
- Resolvers are thin: check access, plain `find`/`findOne` inline, and one business-logic call for anything with rules.
- Data loaders (`data-loaders/purchasing/`) resolve the nested vendor and order on list rows.
- Workflow mutations include `submit/approve/reject/reopen/cancelRequisition`, `selectQuote`, `createOrderFromRequisition`, `createOrderFromQuote`, `submit/approve/markSent/cancel/closeOrder`, `returnOrderToDraft`, `postReceipt`, `voidReceipt`, `createInvoice`, `voidInvoice`, `postPayment`, `voidPayment`, `createCatalogItemFromLine`.
- After changing SDL or gql documents, run `yarn codegen` (rewrites `types/schema.graphql`, `graphql.ts`, `resolvers.ts`, `client-operations.ts`).

## Attachments

Quotes, orders, receipts, invoices, payments and requisitions can carry files: 10 MB maximum, PDF, images, Office and text files (`constants/purchasing.ts`). Same pattern as Meetings:

1. The client asks for an upload; the server creates a pending row and returns a presigned PUT URL (valid 15 minutes).
2. The browser PUTs the file directly to object storage under `purchasing-attachments/<ownerType>/<ownerId>/` (`StorageFolders.PurchasingAttachments`, private).
3. The client completes the upload; the server verifies size and sha through `getFileInfo` and marks the row ready.
4. Downloads use presigned URLs valid for 5 minutes.

Deleting a document deletes its files. Files live in object storage, never in Mongo.

## Reports and Excel export

Computed on the server in `business-logic/purchasing/reports.ts` (not client side):

- Spending by vendor and by month (billed amounts, from invoices).
- Open orders with the value still due and a late flag.
- Payables aging: not yet due, 1-30, 31-60, 61+ days late.
- Vendor ledger: invoices, payments, running balance.
- Dashboard counters: requisitions and orders awaiting approval, open orders, overdue invoices, total payable, overdue amount.

Excel downloads go through `/generate-report` with generators `PurchasingSpendingByVendor`, `PurchasingSpendingByMonth`, `PurchasingOpenOrders`, `PurchasingPayablesAging`, `PurchasingVendorLedger` (`business-logic/purchasing/exporters.ts`, wired in `setup-rest-endpoints.ts`). The exporters are kept out of the barrel `index.ts` because they need `exceljs`.

## Web UI

`idreesia-web/imports/ui/modules/purchasing/`; follows `docs/ui-design-guidelines/ui-design-guidelines.md`.

- Shell: `index.ts`, `router.tsx`, `sidebar.tsx`, `menu-entries.tsx` (each sidebar item is shown only to users holding one of its permissions), `landing.tsx`, `purchasing.styles.css` (imported in `client/main.tsx`). Registered in `main-layout/{header-content,main-content,sidebar-content}.tsx`.
- Audit Logs page (`audit-logs/`): module-wide list of every change across all Purchasing document types, filterable by document type and date range, backed by `pagedPurchasingAuditLogs` (which takes `PurchasingAuditLogFilter` and is always limited to the purchasing entity types). The per-document History tab uses the same query with an `entityId`.
- Sidebar: Dashboard, Requisitions, Quotes, Purchase Orders, Goods Receipts, Invoices, Payments, then a Setup group (Vendors, Catalog) and an Administration group (Reports, Audit Logs).
- Feature folders: `vendors`, `catalog`, `requisitions`, `quotes`, `orders` (with a print page), `receipts`, `invoices`, `payments`, `reports`.
- Shared in `common/`: `line-items-editor` (one editor for requisition, quote, order and invoice lines; catalog picker that also accepts free text, "Add to catalog" row action, live totals), `lines-table`, `totals-summary`, `status-tag`, `vendor-select`, `record-select`, `document-list` (with `document-list-filter`: the Stores-style Filter popover, active-filter chips and Reload), `reason-modal`, `run-action`, `history-tab`, `attachments-tab`, `format`.
- Document pages use URL-synced tabs (Details, Related Documents, Attachments, History) and action buttons that appear only when the status and the user's permissions allow.
- Typed gql documents live in each feature's `gql/` folder; error handling goes through `run-action.ts` (Apollo `CombinedGraphQLErrors`).

## Migration and indexes

`idreesia-web/imports/startup/server/migrations/75-create-purchasing-indexes.ts`, registered in `migrations/index.ts`. Creates unique document numbers per collection, a case-insensitive unique catalog name, a unique `(type, year)` on counters, a unique vendor invoice number per vendor, and lookup indexes on `status`, `vendorId`, `orderId`, `requisitionId`, `dueDate`, `lines.catalogItemId` and `(ownerType, ownerId)`. It runs on the first start after deploy.

## Testing

- Vitest with an in-memory Mongo replica set. Business-logic tests: `vendors`, `catalog-items`, `numbering` (including concurrency), `procure-to-pay` (the full cycle, over-receipt, over-billing, over-payment, voids, rollback), `reports`, `exporters`, `attachments`; plus `graphql-api/purchasing/attachment/access.test.ts`.
- CI gates: the authorization-matrix snapshot (additive: 69 new entries), `unprotected-fields`, `reference-reads-gated`, `rest-guards-coverage`.
- E2E: `e2e/tests/purchasing/purchasing.spec.ts` (navigation smoke, vendor and catalog CRUD). Not yet run against a live build.
- Run `yarn run lint` (full, as CI) and the three typechecks after changes.

## Where things live

| Piece | Location |
|---|---|
| Collections, schemas, types | `idreesia-common/server/collections/purchasing/`, `…/schemas/purchasing/` |
| Business logic (import from the barrel) | `idreesia-common/server/business-logic/purchasing/` |
| Excel exporters | `…/business-logic/purchasing/exporters.ts` |
| GraphQL | `idreesia-common/server/graphql-api/purchasing/<entity>/` |
| Data loaders | `idreesia-common/server/data-loaders/purchasing/` |
| Constants (statuses, limits) | `idreesia-common/constants/purchasing.ts`; permissions in `constants/permissions.ts` |
| Indexes | `idreesia-web/imports/startup/server/migrations/75-create-purchasing-indexes.ts` |
| UI | `idreesia-web/imports/ui/modules/purchasing/` |
| Tests | `…/business-logic/purchasing/*.test.ts`, `e2e/tests/purchasing/` |

## Known limitations

- An approved order's lines are locked. To change one, cancel it and make a new order.
- One approval step. No amount thresholds or multi-level approval.
- No stock updates and no link to Stores; no multi-currency; no vendor portal; no mobile screens; no notifications.
- Payments must be allocated to invoices; advance payments are not supported.
- The catalog has no merge or de-duplicate tool.
