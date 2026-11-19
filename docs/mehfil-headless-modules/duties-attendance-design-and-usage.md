# Duties and Attendance

A headless module owned by a **mehfil** (an org location of type `mehfil`) rather than a committee. A mehfil with the feature turned on gets one workspace where it defines duties, plans who is on each duty each day, and marks attendance.

It is the [HR duty planning](../duty-planning-attendance.md) model without shifts, duty locations or teams: a duty has a direct roster of karkuns. The two are separate. They share no collections and no code paths; the names carry a `duties-attendance` / `Da` prefix so they don't collide with HR's duties and duty locations.

## Contents

- [Overview](#overview)
- [Where things live](#where-things-live)
- [Turning it on](#turning-it-on)
- [Users and permissions](#users-and-permissions)
- [How a day works](#how-a-day-works)
- [Data model](#data-model)
- [API](#api)
- [Web UI](#web-ui)
- [Responsibilities: caller vs. module](#responsibilities-caller-vs-module)
- [Errors](#errors)
- [Known limitations](#known-limitations)

## Overview

- **Workspace.** One per mehfil, created when the feature is enabled on it. Disabling the feature soft-deletes the workspace; enabling it again restores the same workspace with its duties, attendance and users.
- **Duty.** A named job (Gate, Langar...) with a roster. Each member can be limited to some days of the week.
- **Plan.** Future days are planned by changing the roster, or by per-day overrides: people added for one day, members taken off one day.
- **Attendance.** Each day's roster is locked at the start of the day. Attendance (present, late, absent) is marked against the locked roster.
- **Sheet.** Monthly totals per karkun and duty, from the locked days.

Days are `YYYY-MM-DD` strings in the Asia/Karachi time zone.

## Where things live

| Area | Location |
|------|----------|
| Constants (module name, permissions, statuses) | `idreesia-common/constants/duties-attendance.ts` |
| Location feature keys (and the types they allow) | `idreesia-common/constants/organization/org-location-features.ts` |
| Collections and types | `idreesia-common/server/collections/duties-attendance/` |
| Schemas | `idreesia-common/server/schemas/duties-attendance/` |
| Module logic | `idreesia-common/server/business-logic/duties-attendance/` |
| Turning the feature on/off, users from the location page | `idreesia-common/server/business-logic/admin/org-location-features.ts` |
| Workspace GraphQL (SDL, resolvers, access) | `idreesia-common/server/graphql-api/workspaces/duties-attendance/` |
| Access directive | `idreesia-common/server/graphql-api/_directives/check-duties-attendance-access*.ts` |
| Admin GraphQL (features, users) | `idreesia-common/server/graphql-api/admin/org-location/` |
| Web: workspace pages | `idreesia-web/imports/ui/modules/workspaces/duties-attendance/` |
| Web: location page tabs | `idreesia-web/imports/ui/modules/admin/org-locations/location-features.tsx`, `location-duties-attendance-users.tsx` |
| Indexes | migration `71-create-duties-attendance-indexes.ts` (also created lazily by the module) |
| Nightly job | `create-duties-attendance-day-records` (00:10), in `jobs/job-definitions-registry.ts` |

The module is registered as a headless module (`duties-attendance`) in `server/headless/modules.ts`. It publishes no notifications: the notification plumbing is keyed by committee.

## Turning it on

On the mehfil's edit page (Admin → Locations), the **Features** tab lists the features. Only mehfils have the tab, and `enableOrgLocationFeature` / `disableOrgLocationFeature` reject any other location type.

Enabling stores `features: ['duties-attendance']` and `dutiesAttendanceWorkspaceId` on the location. Both calls need `ADMIN_MANAGE_ORG_LOCATIONS`.

## Users and permissions

A workspace keeps its own users, one document per user in `duties-attendance-workspace-users`. Each has a set of permissions:

| Permission | Allows |
|------------|--------|
| `view` | See duties, the plan, attendance and the sheet. Every other permission includes it. |
| `manage-and-plan-duties` | Create, change and delete duties; manage their members; plan days. |
| `mark-attendance` | Mark present, late or absent. |

A super-admin holds every permission in every workspace. Nobody else is let in by an admin permission: an admin who should use a workspace has to be added to it.

**Users are managed from the mehfil's page in Admin** (the "Duties & Attendance Users" tab, shown while the feature is on), not inside the workspace. That needs `ADMIN_MANAGE_ORG_LOCATIONS` (and `ADMIN_VIEW_ORG_LOCATIONS` to see them). Only unlocked users linked to a person can be added, because the Workspaces menu is only shown to such users.

Every workspace operation carries `@checkDutiesAttendanceAccess(permission: ...)` and takes a `locationId`. The directive resolves the location's workspace, finds the caller's entry and refuses with `FORBIDDEN` if the permission is missing. A location the caller has no part in also answers `FORBIDDEN`, so its existence isn't revealed (a super-admin gets `NOT_FOUND` when the feature is off). The resolver reads the result with `getDutiesAttendanceAccess(context, locationId)`. `duties-attendance-permissions.test.ts` pins the permission each operation needs.

## How a day works

- **A duty starts tomorrow.** Its first planned day is the day after it was created (or after it was last made active again), so its roster can be set up first.
- **The roster** is the duty's members who are available that weekday (no days set means every day), less those taken off for the day, plus those added for the day.
- **Locking.** Today and earlier are locked. A day's roster is written to a day record once and is never recomputed; from then on only attendance changes. Records are written by the nightly job, and lazily whenever a day is read or marked or the roster changes, so a missed job run only delays them. A day nobody is on duty still gets an (empty) record, so a roster set up later never applies to days that came before it.
- **Roster changes apply from tomorrow.** Before a member is added, changed or removed, the days up to today are locked with the old roster.
- **Overrides** can only be set for days after today.
- **Attendance** can be marked for today and for earlier days that have a record, for people on that day's roster. It can't be marked for a future day.
- **Inactive duties** are not planned. Deactivating locks the days up to today first; reactivating restarts planning from tomorrow, so the days in between never get records.
- **Deleting a duty** is only possible if nobody has ever been on duty on it; otherwise make it inactive.

## Data model

| Collection | Holds |
|------------|-------|
| `duties-attendance-workspaces` | `name`, `description?`, `metadata` (`{ locationId }`), soft delete |
| `duties-attendance-workspace-users` | `workspaceId`, `userId`, `permissions[]`. Unique on `{workspaceId, userId}`. |
| `duties-attendance-duties` | `workspaceId`, `name`, `description?`, `isActive`, `startDate`, `members[]` = `{ karkunId, isCoordinator?, daysOfWeek? }` |
| `duties-attendance-day-overrides` | `workspaceId`, `dutyId`, `date`, `addedKarkunIds[]`, `absentKarkunIds[]`. Unique on `{dutyId, date}`. |
| `duties-attendance-day-records` | `workspaceId`, `dutyId`, `date`, `karkuns[]` = `{ karkunId, name, addedForDay, attendance?, attendanceUpdatedAt/By }`. Unique on `{dutyId, date}`. |

## API

Business logic (`business-logic/duties-attendance`, plain functions taking the acting user's id):

- Workspaces: `createDutiesAttendanceWorkspace`, `getDutiesAttendanceWorkspace`, `deleteDutiesAttendanceWorkspace`, `restoreDutiesAttendanceWorkspace`, `purgeDutiesAttendanceWorkspace`
- Users: `addDutiesAttendanceWorkspaceUser`, `updateDutiesAttendanceWorkspaceUserPermissions`, `removeDutiesAttendanceWorkspaceUser`, `searchWorkspaceUserCandidates`
- Duties: `createDuty`, `updateDuty`, `removeDuty`, `addDutyMember`, `updateDutyMember`, `removeDutyMember`
- Plan and attendance: `getDutyPlanDays`, `setDutyDayOverride`, `setDutyAttendance`, `createTodayDayRecords`, `getAttendanceSheet`
- Other: `listMyDutiesAttendanceLocations`, `searchWorkspaceKarkuns`

Workspace GraphQL (all take `locationId`):

| Operation | Permission |
|-----------|------------|
| `workspaceDaAccess`, `workspaceDaDuties`, `workspaceDaDutyById`, `workspaceDaPlanDays`, `workspaceDaAttendanceSheet` | `VIEW` |
| `workspaceDaKarkunSearch`, `workspaceDaCreateDuty`, `workspaceDaUpdateDuty`, `workspaceDaRemoveDuty`, `workspaceDaAddDutyMember`, `workspaceDaUpdateDutyMember`, `workspaceDaRemoveDutyMember`, `workspaceDaSetDayOverride` | `MANAGE_AND_PLAN_DUTIES` |
| `workspaceDaSetAttendance` | `MARK_ATTENDANCE` |
| `myDutiesAttendanceLocations` | caller's own (listed in `unprotected-fields.test.ts`) |

Admin GraphQL (`ADMIN_VIEW_ORG_LOCATIONS` / `ADMIN_MANAGE_ORG_LOCATIONS`): `allOrgLocationFeatures`, `enableOrgLocationFeature`, `disableOrgLocationFeature`, `allDutiesAttendancePermissions`, `dutiesAttendanceUserCandidates`, `orgLocationDutiesAttendanceUsers`, `addOrgLocationDutiesAttendanceUser`, `updateOrgLocationDutiesAttendanceUserPermissions`, `removeOrgLocationDutiesAttendanceUser`.

## Web UI

In **Workspaces**, the location dropdown also lists the mehfils whose workspace the user can open (with their ancestors, as for committees). Under the selected mehfil, a "Duties & Attendance" entry has four pages:

- **Duties**: the duties. Expanding a duty shows its members, as on the HR Teams page (add, set days, coordinator, remove).
- **Duty Planning**: seven days of a duty. Days after today can have people added for the day or members taken off it; earlier days show attendance, locked.
- **Duty Attendance**: a day's roster with P / L / A marks.
- **Attendance Sheet**: the month's totals, for one duty or all.

Controls the user's permissions don't allow are hidden.

## Responsibilities: caller vs. module

The caller (the resolvers) checks access. The module checks nothing about who may do what: it enforces the rules above (dates, locking, the roster, valid karkuns, unique names), stamps `createdBy` / `updatedBy`, and runs multi-document changes in a transaction.

## Errors

`GraphQLError`s with `extensions.code` of `NOT_FOUND`, `CONFLICT`, `BAD_USER_INPUT` or `FORBIDDEN` (`dutiesAttendanceError` in `errors.ts`).

## Known limitations

- No notifications and no mobile screens yet.
- No printable attendance cards or reports (HR has them).
- There is no activity log; the day record keeps who last marked each person.
- Users can be managed only from the admin page, not from inside the workspace.
- The unit tests run against an in-memory MongoDB, which has no Karachi-time job scheduling: the nightly job is tested through `createTodayDayRecords`.
