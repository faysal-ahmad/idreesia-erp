# Meetings

The meetings module is a **headless backend module**. It stores meetings in workspaces, with participants (invitation responses and attendance), an agenda, minutes, action items, file attachments and an activity log. It has no GraphQL API, REST routes or UI of its own. A feature that needs meetings calls its functions from its own resolvers or routes.

Attachment files live in the S3-compatible object storage (RustFS locally, DigitalOcean Spaces in production). Mongo holds only metadata and object keys.

| Piece | Location |
|---|---|
| Public API (import from here) | `idreesia-common/server/business-logic/meetings/` |
| Collections and document types | `idreesia-common/server/collections/meetings/` |
| Schemas | `idreesia-common/server/schemas/meetings/` |
| Constants (statuses, actions, limits) | `idreesia-common/constants/meetings.ts` |
| Storage helpers | `idreesia-common/server/file-storage/` |
| Indexes | `idreesia-web/imports/startup/server/migrations/61-create-meetings-indexes.ts` |

```ts
import {
  createMeetingsWorkspace,
  createMeeting,
  markAttendance,
} from 'meteor/idreesia-common/server/business-logic/meetings';
```

The module is server-only. Import from the barrel above, not from individual files inside it. It is independent of the [DMS](dms-design-and-usage.md): the two share no code or data.

## Responsibilities: caller vs. module

**The caller decides access.** The module never checks whether a user may see or change a workspace, meeting, attachment or action item. Before calling it, the consuming feature must:
- authenticate the user,
- check its own permissions (for example "is this user a member of the committee that owns this workspace"),
- and make sure the ids it passes belong to what the user may touch (`meeting.workspaceId`, `attachment.meetingId`, `actionItem.meetingId`).

**The module enforces integrity.** Whoever calls it, the module guarantees:
- **Valid times.** A meeting ends after it starts; its time zone is a real IANA zone.
- **Status rules hold** (see [Meeting status](#meeting-status)).
- **Participants are unique** within a meeting.
- **Concurrent edits don't overwrite each other.** Changes to participants and the agenda fail with `CONFLICT` if the meeting changed since it was read.
- **Upload limits apply** (size and MIME type, per workspace).
- **Only the user who started a direct upload** can complete or abort it.

**Every function takes the acting `userId`**, reads included. It is recorded in `createdBy` / `updatedBy`, attendance's `markedBy`, and the activity log. A missing or empty `userId` fails with `BAD_USER_INPUT`. The only exception is the maintenance function `purgeExpiredAttachmentUploads()`.

**Participants are opaque ids.** A participant, an action item's assignee and an agenda item's presenter are plain strings the caller chooses, typically karkun ids. The module never looks them up. `userId` (who is acting) and `participantId` (who is invited) are separate. When a participant answers their own invitation, the caller passes both.

**Workspaces are independent.** A meetings workspace has no link to ERP Workspaces (committees) or any other entity. The consuming feature stores the workspace id on its own records, for example `committee.meetingsWorkspaceId`, and uses `metadata` for anything else it needs.

## Concepts

### Workspaces
A workspace is the top-level container. It has a name, an optional description, free-form `metadata`, and optional `settings`:

| Setting | Meaning | Default |
|---|---|---|
| `maxFileSize` | Largest attachment in bytes | `MEETINGS_DEFAULT_MAX_FILE_SIZE` (100 MB) |
| `allowedMimeTypes` | Exact types (`application/pdf`) or wildcards (`image/*`) | Any type |

Deleting a workspace is a soft delete. While it is deleted, every operation on its meetings, attachments and action items fails with `NOT_FOUND`. It can be restored, or purged, which removes everything permanently.

### Meetings
A meeting is a one-off event: title, `startsAt`/`endsAt` (stored in UTC), a `timeZone` to show it in (default `Asia/Karachi`), and optional description, location, online link (`http(s)` only), tags and metadata. Recurring meetings are not supported yet.

### Meeting status

| Status | Meaning | What can change |
|---|---|---|
| `scheduled` | Upcoming or in progress | Everything |
| `completed` | Held | Details (not the time), agenda, minutes, attendance, attachments, action items. Not participants or invitation responses. |
| `cancelled` | Won't take place | Nothing, until it is reopened. It can still be deleted. |

Transitions: `completeMeeting` (scheduled → completed, only once the meeting has started), `cancelMeeting` (scheduled → cancelled), `reopenMeeting` (cancelled or completed → scheduled). Anything else fails with `CONFLICT`, with `extensions.status` giving the current status.

### Participants, responses and attendance
Each participant has a `role` (`organizer`, `required` (the default) or `optional`), an invitation response `rsvp.status` (`pending`, `accepted`, `declined` or `tentative`) and, once recorded, `attendance.status` (`present`, `absent`, `late` or `excused`).
- New participants start with a `pending` response.
- Attendance can only be recorded once the meeting has started. `markAttendance` takes entries for some or all participants; `status: null` clears one.
- A meeting has at most 500 participants.

### Agenda
An ordered list of items: title, optional description, `durationMinutes` and `presenterId`. Each item has an `_id`, which action items can refer to. At most 100 items.

### Minutes
One text field per meeting (`minutes.text`, with `updatedAt`/`updatedBy`). It is stored as given, plain text or markdown. The module doesn't interpret it. Maximum 500,000 characters.

### Action items
Tasks from a meeting: title, optional description, `assigneeId`, `dueDate` and `agendaItemId` (an item on the same meeting). Status is `open`, `in-progress`, `done` or `cancelled`. Moving to `done` records `completedAt`/`completedBy`, and moving away from it clears them. Removing an agenda item unlinks the action items that referred to it.

### Attachments
Flat files on a meeting: there are no folders, versions or locks. Each has a display `name` (defaulting to the file name), an optional description, the original `fileName`, `mimeType` and `size`, and a SHA-256 for server-side uploads. Storage key: `meeting-attachments/<workspaceId>/<meetingId>/<attachmentId>.<ext>`.

### Counters
Each meeting carries `attachmentCount` and `openActionItemCount` (action items that are `open` or `in-progress`), so listings don't need extra queries.

### Text fields
Titles and names are trimmed, runs of whitespace are collapsed, and they must be 1–255 characters with no control characters. File names also can't contain `/` or `\`. Descriptions are trimmed and limited to 10,000 characters. Tags and metadata follow the same rules as the DMS: tags are lower-cased, de-duplicated, at most 50 of up to 64 characters. Metadata keys use letters, digits, `_` and `-` only.

## Errors

Every failure is a `GraphQLError` with `extensions.code`, so a GraphQL resolver can let it propagate unchanged. A REST route should map the codes to HTTP statuses:

| `extensions.code` | Meaning | Suggested HTTP |
|---|---|---|
| `NOT_FOUND` | No such workspace, meeting, participant, agenda item, attachment, action item or upload. Also returned when the workspace is deleted. | 404 |
| `CONFLICT` | Not allowed in the meeting's status; attendance or completion before the start; duplicate participant; concurrent change ("reload and try again"); restoring a workspace that isn't deleted or purging one that is | 409 |
| `BAD_USER_INPUT` | Invalid title, time, time zone, URL, role or status value, tags, metadata, MIME type or size | 400 |
| `FORBIDDEN` | Completing or aborting someone else's direct upload | 403 |
| `TOO_LARGE` | File is over the workspace's `maxFileSize`. `extensions.maxFileSize` gives the limit. | 413 |
| `UPLOAD_INCOMPLETE` | Direct upload not yet PUT, size mismatch, or expired | 409 / 400 |

Map any other error to a 500.

## Paging

Paged lists return `{ data, totalResults }` (`MeetingsPage<T>`) and accept `skip` (default `0`) and `limit` (default `50`, capped at `200`).

## API reference

Every function is `async`. Document types are exported from `collections/meetings`: `MeetingsWorkspaceDocument`, `MeetingDocument`, `MeetingAttachmentDocument`, `MeetingActionItemDocument` and `MeetingsActivityDocument`. Dates can be passed as `Date`, ISO strings or epoch milliseconds. For optional fields in update functions, `undefined` leaves the field as it is and `null` clears it.

### Workspaces

Workspace functions carry a `Meetings` prefix, so a feature can import them next to the DMS's.

| Function | Returns | Notes |
|---|---|---|
| `createMeetingsWorkspace({ name, description?, metadata?, settings? }, userId)` | workspace | |
| `updateMeetingsWorkspace(workspaceId, { name?, description?, metadata?, settings? }, userId)` | workspace | `metadata` and `settings` replace the whole object |
| `getMeetingsWorkspace(workspaceId, userId, { includeDeleted? })` | workspace | |
| `listMeetingsWorkspaces(userId, { workspaceIds?, nameContains?, includeDeleted?, onlyDeleted?, skip?, limit? })` | `MeetingsPage<workspace>` | |
| `deleteMeetingsWorkspace(workspaceId, userId)` | – | Soft delete |
| `restoreMeetingsWorkspace(workspaceId, userId)` | workspace | |
| `purgeMeetingsWorkspace(workspaceId, userId)` | – | Only a deleted workspace. Removes meetings, action items, attachments with their files, and activity. |

### Meetings

| Function | Returns | Notes |
|---|---|---|
| `createMeeting({ workspaceId, title, startsAt, endsAt, timeZone?, description?, location?, onlineUrl?, tags?, metadata?, participants?, agenda? }, userId)` | meeting | `participants`: `[{ participantId, role? }]`. `agenda`: `[{ title, description?, durationMinutes?, presenterId? }]`. |
| `getMeeting(meetingId, userId)` | meeting | |
| `updateMeeting(meetingId, { title?, startsAt?, endsAt?, timeZone?, description?, location?, onlineUrl?, tags?, metadata? }, userId)` | meeting | Changing a time reschedules, which only works on a scheduled meeting. Other fields can also change on a completed one. |
| `listMeetings(workspaceId, userId, options)` | `MeetingsPage<meeting>` | See below |
| `listParticipantMeetings(participantId, userId, { workspaceIds?, rsvpStatus?, ...filters })` | `MeetingsPage<meeting>` | A participant's meetings across workspaces. Pass the `workspaceIds` your feature authorised. Deleted workspaces are always left out. |
| `cancelMeeting(meetingId, userId, { reason? })` | meeting | |
| `completeMeeting(meetingId, userId)` | meeting | Only once the meeting has started |
| `reopenMeeting(meetingId, userId)` | meeting | Clears the cancellation or completion fields |
| `deleteMeeting(meetingId, userId)` | – | Permanent. Removes its attachments with their files and its action items, but keeps its activity entries. |

**List filters** (both list functions): `from` (meetings that end after it), `to` (meetings that start before it), `status` (one or a list), `tags` (all of them), `metadata` (`{ key: value }`, exact top-level match), `sortOrder` (`asc`, the default, means soonest first by `startsAt`), `skip` and `limit`. `listMeetings` also takes `participantId` and `text` (whole words in title, description and tags; no stemming, no partial words).

### Participants

| Function | Returns | Notes |
|---|---|---|
| `addParticipants(meetingId, [{ participantId, role? }], userId)` | meeting | Scheduled meetings only. A participant who is already invited fails with `CONFLICT`. |
| `removeParticipant(meetingId, participantId, userId)` | meeting | Scheduled only |
| `setParticipantRole(meetingId, participantId, role, userId)` | meeting | Scheduled only |
| `respondToInvitation(meetingId, participantId, { status, comment? }, userId)` | meeting | Scheduled only. Sets `respondedAt`, except for `pending`. |
| `markAttendance(meetingId, [{ participantId, status \| null, note? }], userId)` | meeting | Scheduled or completed meetings, after `startsAt` |

### Agenda

| Function | Returns | Notes |
|---|---|---|
| `addAgendaItem(meetingId, { title, description?, durationMinutes?, presenterId?, position? }, userId)` | `{ meeting, agendaItem }` | `position` is 0-based; default is the end |
| `updateAgendaItem(meetingId, agendaItemId, changes, userId)` | meeting | |
| `removeAgendaItem(meetingId, agendaItemId, userId)` | meeting | Unlinks action items that referred to it |
| `reorderAgenda(meetingId, orderedIds, userId)` | meeting | Must list every item exactly once |

### Minutes

| Function | Returns | Notes |
|---|---|---|
| `setMinutes(meetingId, text \| null, userId)` | meeting | Replaces the minutes. An empty string or `null` clears them. |

### Attachments

| Function | Returns | Notes |
|---|---|---|
| `uploadAttachment({ meetingId, fileName, body, mimeType, name?, description? }, userId)` | attachment | `body` is a `Buffer` |
| `listAttachments(meetingId, userId)` | attachment[] | Oldest first |
| `getAttachment(attachmentId, userId)` | attachment | |
| `updateAttachment(attachmentId, { name?, description? }, userId)` | attachment | |
| `getAttachmentDownloadUrl(attachmentId, userId, { inline?, expiresInSec? })` | `{ url, expiresAt, fileName, mimeType, size }` | Presigned GET that saves under the original file name. Defaults to `MEETINGS_DOWNLOAD_URL_EXPIRY_SECONDS` (15 min). Logged as a download. |
| `readAttachmentContent(attachmentId, userId)` | `{ body, fileName, mimeType }` | Loads the whole file into memory. Logged as a download. |
| `deleteAttachment(attachmentId, userId)` | – | Permanent, file included |

**Direct uploads (browser → storage).** These work the same way as in the DMS:
1. **Start:** the server calls `createAttachmentUploadUrl({ meetingId, fileName, mimeType, size, name?, description? }, userId)` and returns the ticket `{ uploadId, attachmentId, url, method: 'PUT', headers, expiresAt }` to the client.
2. **Upload:** the client `PUT`s the raw bytes to `ticket.url` with `ticket.headers`. These include `Content-Type`, which must match exactly.
3. **Finish:** the server calls `completeAttachmentUpload(uploadId, userId, { sha256? })`. This checks that the file is stored, that its size matches and that it is within limits.

The URL is valid for `MEETINGS_UPLOAD_URL_EXPIRY_SECONDS` (15 min). If completion fails, the upload stays pending, so the client can retry or call `abortAttachmentUpload(uploadId, userId)`. `purgeExpiredAttachmentUploads()` removes expired pending uploads. Nothing schedules it yet. The bucket needs the CORS rule described in the [DMS doc](dms-design-and-usage.md#direct-uploads-browser--storage).

Attachments can't be added, changed or deleted while the meeting is cancelled.

### Action items

| Function | Returns | Notes |
|---|---|---|
| `createActionItem({ meetingId, title, description?, assigneeId?, dueDate?, agendaItemId? }, userId)` | action item | Starts `open` |
| `getActionItem(actionItemId, userId)` | action item | |
| `updateActionItem(actionItemId, { title?, description?, assigneeId?, dueDate?, agendaItemId? }, userId)` | action item | |
| `setActionItemStatus(actionItemId, status, userId)` | action item | |
| `deleteActionItem(actionItemId, userId)` | – | |
| `listActionItems(workspaceId, userId, { meetingId?, assigneeId?, status?, dueBefore?, skip?, limit? })` | `MeetingsPage<action item>` | Soonest due first; items without a due date come first |

Action items can't be created or changed while their meeting is cancelled.

### Activity log

`listMeetingsActivity(workspaceId, userId, { meetingId?, entityId?, before?, limit? })` returns entries newest first, and works on deleted workspaces too. To page, pass the last entry's `at` as `before`. Entry shape: `{ workspaceId, meetingId?, entityType, entityId, action, userId, at, details? }`. `entityType` is one of `workspace`, `meeting`, `participant`, `agenda-item`, `attachment` and `action-item`. The `action` values are `MeetingsAction` in `constants/meetings.ts`:

| Area | Actions |
|---|---|
| Workspace | `workspace-created`, `workspace-updated`, `workspace-deleted`, `workspace-restored` |
| Meeting | `meeting-created`, `meeting-updated`, `meeting-rescheduled`, `meeting-cancelled`, `meeting-reopened`, `meeting-completed`, `meeting-deleted` |
| Participants | `participants-added`, `participant-removed`, `participant-role-changed`, `invitation-responded`, `attendance-marked` |
| Agenda / minutes | `agenda-item-added`, `agenda-item-updated`, `agenda-item-removed`, `agenda-reordered`, `minutes-updated` |
| Attachments | `attachment-added`, `attachment-updated`, `attachment-deleted`, `attachment-downloaded` |
| Action items | `action-item-created`, `action-item-updated`, `action-item-status-changed`, `action-item-deleted` |

## Data model

| Collection | Holds |
|---|---|
| `meetings-workspaces` | name, description, metadata, settings, timestamps, `deletedAt`/`deletedBy` |
| `meetings` | `workspaceId`, title, description, location, `onlineUrl`, `startsAt`, `endsAt`, `timeZone`, `status` with cancellation/completion fields, `tags`, `metadata`, embedded `participants[]`, `agenda[]` and `minutes`, `attachmentCount`, `openActionItemCount`, `revision`, timestamps |
| `meetings-attachments` | `workspaceId`, `meetingId`, `name`, `description?`, `fileName`, `mimeType`, `size`, `fileKey`, `sha256?`, `etag?`, `status` (`pending`/`ready`), `uploadExpiresAt?`, timestamps |
| `meetings-action-items` | `workspaceId`, `meetingId`, `agendaItemId?`, title, description, `assigneeId?`, `dueDate?`, `status`, `completedAt/By?`, timestamps |
| `meetings-activities` | see [Activity log](#activity-log) |

Change this data only through the API. Writing to the collections directly bypasses validation, status rules, counters and the activity log. `revision` goes up on every change to a meeting; changes to participants and the agenda use it to detect concurrent edits.

## Integrating a feature

A minimal GraphQL integration, for example a committee "Meetings" feature:

```ts
import {
  createMeeting,
  listMeetings,
} from 'meteor/idreesia-common/server/business-logic/meetings';

// Resolver: the permission check is yours; the module trusts it.
async committeeMeetings(_, { committeeId, from, to }, { user }) {
  const committee = await requireCommitteeMember(user, committeeId);
  return listMeetings(committee.meetingsWorkspaceId, user._id, { from, to });
}
```

**Checklist for a new consumer:**
1. Create a meetings workspace for each owning entity and store its id on that entity (a committee feature handler can create it on enable and soft-delete it on disable, like the Documents feature does with the DMS).
2. Before every call, check that the user may act on that workspace. When the caller passes a meeting, attachment or action-item id, also check that it belongs to the workspace you authorised.
3. Decide who may cancel, complete, delete meetings and purge workspaces; the module doesn't restrict them.
4. Use direct uploads for anything that may be large, and call `purgeExpiredAttachmentUploads()` periodically if you do.

## Limits and constants

All of these are in `idreesia-common/constants/meetings.ts`:

| Constant | Value |
|---|---|
| `MEETINGS_DEFAULT_MAX_FILE_SIZE` | 100 MB (per-workspace override: `settings.maxFileSize`) |
| `MEETINGS_UPLOAD_URL_EXPIRY_SECONDS` | 900 |
| `MEETINGS_DOWNLOAD_URL_EXPIRY_SECONDS` | 900 (per-call override: `expiresInSec`) |
| `MEETINGS_DEFAULT_PAGE_SIZE` / `MEETINGS_MAX_PAGE_SIZE` | 50 / 200 |
| `MEETINGS_MAX_TITLE_LENGTH` | 255 |
| `MEETINGS_MAX_PARTICIPANTS` / `MEETINGS_MAX_AGENDA_ITEMS` | 500 / 100 |
| `MEETINGS_DEFAULT_TIME_ZONE` | `Asia/Karachi` |

## Known limitations

- **No recurring meetings.** Each meeting is a one-off. A later version can add a series with a recurrence rule.
- **No notifications or reminders.** The consuming feature sends any invitations or reminders itself.
- **Multi-step operations are not transactional.** For example, a deleted meeting's records are removed before its files, so a failed file deletion leaves an orphaned object in storage rather than a record pointing at a missing file.
- **Server-side uploads and reads are not streamed.** Use direct uploads and download URLs for large files.
- **Lists return whole meeting documents**, including minutes and the participant list.
