# Mehfil Details

A feature of a **mehfil** (an org location of type `mehfil`). It makes the mehfil's details (address, start year, timings, LCD/tab availability, other details and the map pin) available in Workspaces to the users who hold a permission for it, so they don't need access to Admin > Organization Management.

Administrators still edit the same details on the location's "Mehfil Details" tab in Admin. The two screens are separate: they share the stored data (`OrgLocations.mehfilDetails`) and nothing else. The workspace has its own form, map and geocoding code.

## Permissions

Kept like every location permission, one document per user in `org-location-users`, stored as `mehfil-details.<key>` and granted from the mehfil's Permissions tab in Admin.

| Permission | Allows |
|------------|--------|
| `view` | See the details and the map. `update` includes it. |
| `update` ("Update Mehfil Details") | Change the details. |

A super-admin holds both in every mehfil. Without `update` the workspace page shows the details read-only.

## Where things live

| Area | Location |
|------|----------|
| Constants | `idreesia-common/constants/mehfil-details.ts` |
| Feature registration | `idreesia-common/constants/organization/org-location-features.ts` |
| Access check, location list, update | `idreesia-common/server/business-logic/mehfil-details/` |
| Access directive | `idreesia-common/server/graphql-api/_directives/check-mehfil-details-access*.ts` |
| Workspace GraphQL | `idreesia-common/server/graphql-api/workspaces/mehfil-details/` |
| Web | `idreesia-web/imports/ui/modules/workspaces/mehfil-details/` |

Every workspace operation carries `@checkMehfilDetailsAccess(permission: ...)` and takes a `locationId`. Reading needs `VIEW`, saving needs `UPDATE`. Only the details are saved; the name and place in the hierarchy remain Admin's.
