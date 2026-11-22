# Mehfil Karkuns

A feature of a **mehfil** (an org location of type `mehfil`). It lists, in Workspaces, the karkuns who belong to the mehfil (their `karkunData.mehfilLocationId` is the location), so the users who hold the permission don't need access to HR or Admin.

The list is read-only. Karkuns are still assigned to a mehfil from HR.

## Permissions

Kept like every location permission, one document per user in `org-location-users`, stored as `mehfil-karkuns.<key>` and granted from the mehfil's Permissions tab in Admin (or Mehfil Permissions in Workspaces).

| Permission | Allows |
|------------|--------|
| `view` | See the mehfil's karkuns. |

A super-admin holds it in every mehfil.

## Where things live

| Area | Location |
|------|----------|
| Constants | `idreesia-common/constants/mehfil-karkuns.ts` |
| Feature registration | `idreesia-common/constants/organization/org-location-features.ts` |
| Access check, location list, karkun list | `idreesia-common/server/business-logic/mehfil-karkuns/` |
| Access directive | `idreesia-common/server/graphql-api/_directives/check-mehfil-karkuns-access*.ts` |
| Workspace GraphQL | `idreesia-common/server/graphql-api/workspaces/mehfil-karkuns/` |
| Web | `idreesia-web/imports/ui/modules/workspaces/mehfil-karkuns/` |

Every workspace operation carries `@checkMehfilKarkunsAccess(permission: VIEW)` and takes a `locationId`. The list is a server-paged people search for karkuns only, filtered by mehfil, with a name search.
