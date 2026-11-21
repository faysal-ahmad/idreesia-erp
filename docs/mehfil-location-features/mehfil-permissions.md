# Mehfil Permissions

A feature of a **mehfil** (an org location of type `mehfil`). It lets the users who hold a permission for it see and manage, from Workspaces, who holds which permission on the mehfil, for every feature (including this one). Administrators can still do the same on the location's "Permissions" tab in Admin. The two screens are separate: they share the stored data (`org-location-users`) and nothing else. The workspace has its own logic, GraphQL API and UI.

## Permissions

Stored like every location permission, as `mehfil-permissions.<key>` on the user's `org-location-users` entry.

| Permission | Allows |
|------------|--------|
| `view` | See each feature's permissions and the users holding them. `manage` includes it. |
| `manage` | Give a karkun a permission and take one away, for any feature of the mehfil. |

A super-admin holds both in every mehfil. Without `manage` the page is read-only.

A user who can manage can also give themselves or others `manage`, and any other permission. Hand it out with that in mind.

## Rules (the same as in Admin)

- Only a karkun with an unlocked user account can be given a permission.
- Giving a feature permission also gives the feature's base permission (`view`).
- Taking a feature's `view` takes all of that feature's permissions.
- A user left with no permissions is removed from the mehfil.

## Where things live

| Area | Location |
|------|----------|
| Constants | `idreesia-common/constants/mehfil-permissions.ts` |
| Feature registration | `idreesia-common/constants/organization/org-location-features.ts` |
| Access check, lists, grant/revoke, karkun search | `idreesia-common/server/business-logic/mehfil-permissions/` |
| Access directive | `idreesia-common/server/graphql-api/_directives/check-mehfil-permissions-access*.ts` |
| Workspace GraphQL | `idreesia-common/server/graphql-api/workspaces/mehfil-permissions/` |
| Web | `idreesia-web/imports/ui/modules/workspaces/mehfil-permissions/` |

Every workspace operation carries `@checkMehfilPermissionsAccess(permission: ...)` and takes a `locationId`. Reading needs `VIEW`; granting, revoking and searching karkuns need `MANAGE`.
