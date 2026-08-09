# MongoDB ER Diagram

Logical entity-relationship view of the MongoDB collections used by Idreesia ERP.

Sources: `idreesia-common/server/collections/**`, `idreesia-common/server/schemas/**`, and migrations under `idreesia-web/imports/startup/server/migrations/`.

MongoDB is document-oriented (no enforced FKs). Relationships below are application-level: fields named `*Id` / `*Ids[]` reference other documents’ `_id`.

## Conventions

| Convention | Meaning |
|---|---|
| `*Id` | Single FK to another collection’s `_id` |
| `*Ids[]` | Array of FKs |
| `karkunId` / `visitorId` / inventory person fields | Point to **`common-people`** after migration 39 |
| Audit fields | Most docs include `createdAt` / `createdBy` / `updatedAt` / `updatedBy` |
| Approvable docs | Also include `approvedOn` / `approvedBy` |

## Overview (active domains)

```mermaid
erDiagram
  USERS ||--o| PEOPLE : "personId"
  PEOPLE ||--o| USERS : "userId"
  PEOPLE }o--o| ATTACHMENTS : "imageId / attachmentIds"
  PEOPLE }o--o| CITIES : "karkunData.cityId"
  PEOPLE }o--o| CITY_MEHFILS : "karkunData.cityMehfilId"
  PEOPLE }o--o| JOBS : "employeeData.jobId"

  CITIES ||--o{ CITY_MEHFILS : "cityId"
  CITIES ||--o{ CITIES : "peripheryOf"

  PEOPLE ||--o{ KARKUN_DUTIES : "karkunId"
  PEOPLE ||--o{ ATTENDANCES : "karkunId"
  PEOPLE ||--o{ SALARIES : "karkunId"
  PEOPLE ||--o{ VISITOR_STAYS : "visitorId"
  PEOPLE ||--o{ MEHFIL_KARKUNS : "karkunId"

  PHYSICAL_STORES ||--o{ STOCK_ITEMS : "physicalStoreId"
  PHYSICAL_STORES ||--o{ PURCHASE_FORMS : "physicalStoreId"
  PHYSICAL_STORES ||--o{ ISSUANCE_FORMS : "physicalStoreId"

  MEHFILS ||--o{ MEHFIL_KARKUNS : "mehfilId"
  MEHFILS ||--o{ MEHFIL_LANGAR_DETAILS : "mehfilId"

  USERS {
    string _id PK
    string personId FK
    string username
  }
  PEOPLE {
    string _id PK
    string userId FK
    bool isVisitor
    bool isKarkun
    bool isEmployee
  }
  ATTACHMENTS {
    string _id PK
    string name
    string mimeType
  }
  CITIES {
    string _id PK
    string name
  }
  CITY_MEHFILS {
    string _id PK
    string cityId FK
  }
  JOBS {
    string _id PK
    string name
  }
  PHYSICAL_STORES {
    string _id PK
    string name
  }
  MEHFILS {
    string _id PK
    string name
  }
```

---

## Common & Admin

```mermaid
erDiagram
  USERS ||--o{ USER_GROUPS : "groups[]"
  USERS ||--o| PEOPLE : "personId"
  PEOPLE ||--o| USERS : "userId"
  PEOPLE }o--o| ATTACHMENTS : "sharedData.imageId"
  PEOPLE }o--o{ ATTACHMENTS : "karkunData.attachmentIds"
  SECURITY_LOGS }o--o| USERS : "userId / operationBy"
  SECURITY_LOGS }o--o| USER_GROUPS : "groupId"
  AUDIT_LOGS }o--o| USERS : "operationBy"

  USERS {
    string _id PK
    string username
    string personId FK
    string_array permissions
    string_array groups
    string_array instances
    bool locked
  }
  USER_GROUPS {
    string _id PK
    string name
    string moduleName
    string_array permissions
    string_array instances
  }
  PEOPLE {
    string _id PK
    bool isVisitor
    bool isKarkun
    bool isEmployee
    string userId FK
    string dataSource
    object sharedData
    object visitorData
    object karkunData
    object employeeData
  }
  ATTACHMENTS {
    string _id PK
    string name
    string description
    string mimeType
    string data
  }
  REMOVED_ATTACHMENTS {
    string _id PK
    string name
    string mimeType
  }
  AUDIT_LOGS {
    string _id PK
    string entityId
    string entityType
    string operationType
    string operationBy FK
    date operationTime
  }
  SECURITY_LOGS {
    string _id PK
    string userId FK
    string groupId FK
    string operationType
    string operationBy FK
    date operationTime
  }
```

### People model

One collection (`common-people`) holds visitors, karkuns, and employees:

| Flag | Nested document | Used by |
|---|---|---|
| `isVisitor` | `visitorData` | Security |
| `isKarkun` | `karkunData` | HR / outstation |
| `isEmployee` | `employeeData` | HR employees / salaries |

GraphQL still exposes Karkun/Visitor shapes via mappers (`personToKarkun`, `personToVisitor`). Legacy collections `hr-karkuns` and `security-visitors` remain registered but are not the active write path.

### Attachments

- Active blobs: `common-attachments`
- Soft-deleted: `common-removed-attachments`
- Parents store `attachmentIds[]` and/or `imageId` — no reverse FK on attachments

---

## Outstation

```mermaid
erDiagram
  CITIES ||--o{ CITY_MEHFILS : "cityId"
  CITIES ||--o{ CITIES : "peripheryOf"
  PEOPLE }o--o| CITIES : "karkunData.cityId"
  PEOPLE }o--o| CITY_MEHFILS : "karkunData.cityMehfilId"

  CITIES {
    string _id PK
    string name
    string peripheryOf FK
    string country
    string region
  }
  CITY_MEHFILS {
    string _id PK
    string name
    string cityId FK
    string address
  }
  PEOPLE {
    string _id PK
    object karkunData
  }
```

---

## HR

```mermaid
erDiagram
  DUTIES ||--o{ DUTY_SHIFTS : "dutyId"
  DUTIES ||--o{ KARKUN_DUTIES : "dutyId"
  DUTIES ||--o{ ATTENDANCES : "dutyId"
  DUTY_SHIFTS ||--o{ KARKUN_DUTIES : "shiftId"
  DUTY_SHIFTS ||--o{ ATTENDANCES : "shiftId"
  DUTY_LOCATIONS ||--o{ KARKUN_DUTIES : "locationId"
  JOBS ||--o{ ATTENDANCES : "jobId"
  JOBS ||--o{ SALARIES : "jobId"
  PEOPLE ||--o{ KARKUN_DUTIES : "karkunId"
  PEOPLE ||--o{ ATTENDANCES : "karkunId"
  PEOPLE ||--o{ SALARIES : "karkunId"
  PEOPLE }o--o| JOBS : "employeeData.jobId"

  JOBS {
    string _id PK
    string name
    string description
  }
  DUTIES {
    string _id PK
    string name
    bool isMehfilDuty
    string attendanceSheet
  }
  DUTY_SHIFTS {
    string _id PK
    string name
    string dutyId FK
    string startTime
    string endTime
  }
  DUTY_LOCATIONS {
    string _id PK
    string name
  }
  KARKUN_DUTIES {
    string _id PK
    string karkunId FK
    string dutyId FK
    string shiftId FK
    string locationId FK
    string role
  }
  ATTENDANCES {
    string _id PK
    string karkunId FK
    string month
    string dutyId FK
    string shiftId FK
    string jobId FK
    int presentCount
    int absentCount
    int percentage
  }
  SALARIES {
    string _id PK
    string karkunId FK
    string jobId FK
    string month
    number salary
    number netPayment
  }
  PEOPLE {
    string _id PK
    object employeeData
  }
```

---

## Inventory

```mermaid
erDiagram
  PHYSICAL_STORES ||--o{ ITEM_CATEGORIES : "physicalStoreId"
  PHYSICAL_STORES ||--o{ LOCATIONS : "physicalStoreId"
  PHYSICAL_STORES ||--o{ VENDORS : "physicalStoreId"
  PHYSICAL_STORES ||--o{ STOCK_ITEMS : "physicalStoreId"
  PHYSICAL_STORES ||--o{ PURCHASE_FORMS : "physicalStoreId"
  PHYSICAL_STORES ||--o{ ISSUANCE_FORMS : "physicalStoreId"
  PHYSICAL_STORES ||--o{ STOCK_ADJUSTMENTS : "physicalStoreId"

  ITEM_CATEGORIES ||--o{ STOCK_ITEMS : "categoryId"
  LOCATIONS ||--o{ LOCATIONS : "parentId"
  STOCK_ITEMS ||--o{ PURCHASE_FORM_ITEMS : "stockItemId"
  STOCK_ITEMS ||--o{ ISSUANCE_FORM_ITEMS : "stockItemId"
  STOCK_ITEMS ||--o{ STOCK_ADJUSTMENTS : "stockItemId"
  VENDORS ||--o{ PURCHASE_FORMS : "vendorId"

  PEOPLE ||--o{ PURCHASE_FORMS : "receivedBy / purchasedBy"
  PEOPLE ||--o{ ISSUANCE_FORMS : "issuedBy / issuedTo"
  PEOPLE ||--o{ STOCK_ADJUSTMENTS : "adjustedBy"
  ATTACHMENTS ||--o{ STOCK_ITEMS : "imageId"
  ATTACHMENTS ||--o{ PURCHASE_FORMS : "attachmentIds"
  ATTACHMENTS ||--o{ ISSUANCE_FORMS : "attachmentIds"

  PURCHASE_FORMS ||--o{ PURCHASE_FORM_ITEMS : "embeds"
  ISSUANCE_FORMS ||--o{ ISSUANCE_FORM_ITEMS : "embeds"

  PHYSICAL_STORES {
    string _id PK
    string name
    string address
  }
  ITEM_CATEGORIES {
    string _id PK
    string name
    string physicalStoreId FK
  }
  LOCATIONS {
    string _id PK
    string name
    string parentId FK
    string physicalStoreId FK
  }
  VENDORS {
    string _id PK
    string name
    string physicalStoreId FK
  }
  STOCK_ITEMS {
    string _id PK
    string name
    string physicalStoreId FK
    string categoryId FK
    string imageId FK
    string unitOfMeasurement
  }
  PURCHASE_FORMS {
    string _id PK
    date purchaseDate
    string physicalStoreId FK
    string vendorId FK
    string receivedBy FK
    string purchasedBy FK
    string locationId FK
  }
  PURCHASE_FORM_ITEMS {
    string stockItemId FK
    number quantity
    bool isInflow
    number price
  }
  ISSUANCE_FORMS {
    string _id PK
    date issueDate
    string physicalStoreId FK
    string issuedBy FK
    string issuedTo FK
    string locationId FK
  }
  ISSUANCE_FORM_ITEMS {
    string stockItemId FK
    number quantity
    bool isInflow
  }
  STOCK_ADJUSTMENTS {
    string _id PK
    string physicalStoreId FK
    string stockItemId FK
    string adjustedBy FK
    date adjustmentDate
    number quantity
    bool isInflow
  }
```

Line items on purchase/issuance forms are **embedded arrays** (`items[]`), not separate collections. They are shown as entities only to clarify the stock-item relationship.

`inventory-item-types` still exists in code as a legacy catalog (merged into stock items historically).

---

## Security

```mermaid
erDiagram
  MEHFILS ||--o{ MEHFIL_KARKUNS : "mehfilId"
  MEHFILS ||--o{ MEHFIL_LANGAR_DETAILS : "mehfilId"
  MEHFIL_DUTIES ||--o{ MEHFIL_KARKUNS : "dutyId"
  MEHFIL_LANGAR_DISHES ||--o{ MEHFIL_LANGAR_DETAILS : "langarDishId"
  MEHFIL_LANGAR_LOCATIONS ||--o{ MEHFIL_LANGAR_DETAILS : "langarLocationId"
  PEOPLE ||--o{ MEHFIL_KARKUNS : "karkunId"
  PEOPLE ||--o{ VISITOR_STAYS : "visitorId"
  DUTIES ||--o{ VISITOR_STAYS : "dutyId"
  DUTY_SHIFTS ||--o{ VISITOR_STAYS : "shiftId"

  MEHFILS {
    string _id PK
    string name
    date mehfilDate
  }
  MEHFIL_DUTIES {
    string _id PK
    string name
    string urduName
  }
  MEHFIL_KARKUNS {
    string _id PK
    string mehfilId FK
    string karkunId FK
    string dutyId FK
    string dutyCardBarcodeId
  }
  MEHFIL_LANGAR_DISHES {
    string _id PK
    string name
    string urduName
  }
  MEHFIL_LANGAR_LOCATIONS {
    string _id PK
    string name
    string urduName
  }
  MEHFIL_LANGAR_DETAILS {
    string _id PK
    string mehfilId FK
    string langarDishId FK
    string langarLocationId FK
    number quantity
  }
  VISITOR_STAYS {
    string _id PK
    string visitorId FK
    date fromDate
    date toDate
    int numOfDays
    string dutyId FK
    string shiftId FK
  }
```

---

## Collection name map (active)

| Domain | Mongo collection | Code export |
|---|---|---|
| Admin | `users` | `Users` (Meteor.users) |
| Admin | `user-groups` | `UserGroups` |
| Common | `common-people` | `People` |
| Common | `common-attachments` | `Attachments` |
| Common | `common-removed-attachments` | `RemovedAttachments` |
| Common | `common-audit-log` | `AuditLogs` |
| Common | `common-security-log` | `SecurityLogs` |
| Outstation | `outstation-cities` | `Cities` |
| Outstation | `outstation-city-mehfils` | `CityMehfils` |
| HR | `hr-jobs` | `Jobs` |
| HR | `hr-duties` | `Duties` |
| HR | `hr-duty-shifts` | `DutyShifts` |
| HR | `hr-duty-locations` | `DutyLocations` |
| HR | `hr-karkun-duties` | `KarkunDuties` |
| HR | `hr-attendances` | `Attendances` |
| HR | `hr-salaries` | `Salaries` |
| Inventory | `inventory-physical-stores` | `PhysicalStores` |
| Inventory | `inventory-item-categories` | `ItemCategories` |
| Inventory | `inventory-locations` | `Locations` |
| Inventory | `inventory-vendors` | `Vendors` |
| Inventory | `inventory-stock-items` | `StockItems` |
| Inventory | `inventory-purchase-forms` | `PurchaseForms` |
| Inventory | `inventory-issuance-forms` | `IssuanceForms` |
| Inventory | `inventory-stock-adjustments` | `StockAdjustments` |
| Security | `security-mehfils` | `Mehfils` |
| Security | `security-mehfil-duties` | `MehfilDuties` |
| Security | `security-mehfil-karkuns` | `MehfilKarkuns` |
| Security | `security-mehfil-langar-dishes` | `MehfilLangarDishes` |
| Security | `security-mehfil-langar-locations` | `MehfilLangarLocations` |
| Security | `security-mehfil-langar-details` | `MehfilLangarDetails` |
| Security | `security-visitor-stays` | `VisitorStays` |

---

## Dropped / inactive (not in diagrams)

Collection classes may still exist in the repo, but these were removed from the database (or are unused):

| Status | Collections |
|---|---|
| Dropped — migration 42/43 | Accounts (`accounts-*` heads, vouchers, payments, companies, …) |
| Dropped — migration 43 | `portals` |
| Dropped — migration 44 | Imdad (`imdad-*`), wazaif-management collections |
| Code only / unwired | `communication-messages` |
| Legacy leftovers | `hr-karkuns`, `security-visitors`, `security-visitor-mulakaats`, `inventory-item-types` |

---

## Rendering

GitHub and most Markdown previewers render the Mermaid blocks above. For a single printable chart, start with **Overview**, then open the domain section you need.
