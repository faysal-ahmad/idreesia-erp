# Discussions

Discussions is a **headless backend module**. It gives a committee a private group conversation. The module owns **discussion workspaces**, one per committee that has the feature turned on. The messages themselves live in Rocket.Chat; the module keeps only the workspace records and the link to the chat group behind each one.

Callers never see a Rocket.Chat group id. They hold the module's own `workspaceId` and the module resolves the chat group internally.

## Contents

- [Overview](#overview)
- [Where things live](#where-things-live)
- [Responsibilities: caller vs. module](#responsibilities-caller-vs-module)
- [The module contract](#the-module-contract)
- [Workspace lifecycle](#workspace-lifecycle)
- [Conversation functions](#conversation-functions)
- [Files](#files)
- [Committee Discussions feature](#committee-discussions-feature)
- [Data model](#data-model)
- [Notifications](#notifications)
- [Limits and constants](#limits-and-constants)
- [Known limitations](#known-limitations)

## Overview

- **Workspace.** The module's unit of isolation. It has a name, optional free-form `metadata` (the committee feature stores the `committeeId`), and one Rocket.Chat private group behind it. It can be soft-deleted (archived) and restored.
- **Messages live in Rocket.Chat.** Sending, editing, reactions, pins, stars, threads, search and file uploads all go to Rocket.Chat. The ERP is the only thing that talks to it: clients go through GraphQL and the ERP file routes, so the Rocket.Chat URL and the service account's token never reach a client.
- **Two layers.**
  - The **Discussions module** owns workspaces and chat-group membership.
  - The **shared Rocket.Chat conversation functions** read and write messages in a chat group. They are plumbing that any module backed by a chat group can use (Projects uses them for each project's chat). Modules never call each other; both call the shared layer.
- **Acting as the person.** Messages are posted with the acting user's own chat account (their stored token), not the service account. That is what makes mentions and unread counts work per person. A user without a chat account can read but not post.

## Where things live

| Piece | Location |
|---|---|
| Discussions module (workspaces, add/remove user) | `idreesia-common/server/business-logic/discussions/` |
| Shared conversation functions (messages, files) | `idreesia-common/server/business-logic/rocket-chat/conversation.ts` |
| Per-user chat tokens | `idreesia-common/server/business-logic/rocket-chat/user-credentials.ts` |
| Rocket.Chat REST client (private) | `idreesia-common/server/chat/` |
| Workspaces collection | `idreesia-common/server/collections/discussions/` |
| Schema | `idreesia-common/server/schemas/discussions/` |
| Committee feature handler | `idreesia-common/server/business-logic/hr/committee/discussions.ts` |
| GraphQL and access checks | `idreesia-common/server/graphql-api/workspaces/discussions/` |
| File routes | `idreesia-web/imports/startup/server/setup-workspace-discussion-endpoints.ts` |

```ts
import {
  discussionsModule,
  findDiscussionsWorkspace,
  restoreDiscussionsWorkspace,
} from 'meteor/idreesia-common/server/business-logic/discussions';

import {
  sendConversationMessage,
  syncConversationMessages,
} from 'meteor/idreesia-common/server/business-logic/rocket-chat';
```

The module is server-only.

## Responsibilities: caller vs. module

**The caller decides access.** Nothing in the module or the conversation functions checks who may take part. The caller establishes that first (for committees: the person is a member and Discussions is enabled; only coordinators may pin), then passes the workspace and the acting user.

**The module enforces:**
- **Isolation.** A workspace id resolves to exactly one chat group. A message id is only usable in its own group (the conversation functions check the message belongs to the group).
- **Own messages only.** A user can edit or delete only their own messages.
- **Size limits** on messages and files, and signed file URLs (see [Files](#files)).
- **Idempotent membership.** `addUser` and `removeUser` can be called repeatedly.

## The module contract

`discussionsModule` implements the shared `HeadlessModule` contract (see [headless-module-notifications.md](headless-module-notifications.md) for the notification side).

| Function | What it does |
|---|---|
| `createWorkspace({ name, createdBy, metadata })` | Creates a Rocket.Chat private group and a workspace record. Returns `{ module: 'discussions', workspaceId }`. |
| `archiveWorkspace(workspace, userId)` | Archives the chat group (history is kept) and soft-deletes the workspace. Does nothing if already deleted. |
| `addUser(workspace, userId)` | Adds the user's chat account to the group. A user with no chat account is ignored. |
| `removeUser(workspace, userId)` | Removes the user's chat account from the group. A user with no chat account, or not in the group, is ignored. |

Other functions on the module:

| Function | What it does |
|---|---|
| `findDiscussionsWorkspace(workspaceId)` | The workspace record (deleted ones included), or `null`. |
| `restoreDiscussionsWorkspace(workspaceId, userId)` | Brings a soft-deleted workspace back and unarchives its chat group. If the group no longer exists, a new one is created. |
| `getDiscussionChatGroupId(workspaceId)` | The chat group behind a live workspace. Server-only; used to call the conversation functions. Throws `NOT_FOUND` for a missing or deleted workspace. |
| `getDiscussionsWorkspaceChatUserIds(workspaceId)` | Chat user ids currently in the group. |

`addUser` and `removeUser` take an **ERP user id**; the module looks up that user's chat account.

## Workspace lifecycle

1. **Create.** A Rocket.Chat private group is created with a unique, safe name (`discussions-<name>-<random>`), owned by the ERP service account.
2. **Members.** Users are added and removed as membership changes (see [Committee Discussions feature](#committee-discussions-feature)).
3. **Archive.** The chat group is archived and the workspace gets `deletedAt` / `deletedBy`. While deleted, `getDiscussionChatGroupId` fails with `NOT_FOUND`, so every conversation request for it fails.
4. **Restore.** The workspace is un-deleted and the group unarchived (or recreated if it was purged from Rocket.Chat).

Because the workspace id, not the chat group id, is what other records store, the module can later point a workspace at more than one chat group without changing committees or the API.

## Conversation functions

These are in `business-logic/rocket-chat/` and take a **chat group id** (resolved from the workspace by the caller). They are shared with other chat-backed modules.

| Function | Purpose |
|---|---|
| `syncConversationMessages` | The latest page, or with `since` the changes since the last sync: new and edited messages, reactions, pins, thread replies, and the ids of deleted ones. Returns a `syncedAt` to pass back next time. |
| `getOlderConversationMessages` | A page of messages before a given time, with `hasMore`. |
| `getConversationThreadMessages` | A thread: the parent message and its replies. |
| `sendConversationMessage` | Posts a message, optionally as a thread reply. |
| `editConversationMessage`, `deleteConversationMessage` | Only for the user's own messages. |
| `reactToConversationMessage` | Adds or removes an emoji reaction. |
| `setConversationMessagePinned` | Pins or unpins (done as the service account; coordinators only, by the caller). |
| `setConversationMessageStarred` | Stars or unstars for the acting user. |
| `getConversationPinnedMessages`, `getConversationStarredMessages` | Pinned messages, or the acting user's starred ones. |
| `searchConversationMessages` | Words or a `/regex/`, newest page first, with `offset` for the next page. |
| `getConversationMembers` | People in the conversation, for @mention suggestions. The service account is left out. |
| `getConversationInfo` | Whether the user can post (has a chat account). |
| `uploadConversationFile`, `fetchConversationFile` | See [Files](#files). |

Messages are returned as plain ERP objects, not Rocket.Chat objects: emoji instead of shortcodes, system messages turned into readable text (some are left out), sender profile images resolved from the ERP, and `isOwn` and `isStarred` set for the acting user.

## Files

Files live in Rocket.Chat, which the browser cannot reach, so they go through ERP routes: `GET` and `POST` under `/api/workspaces/committees/:committeeId/discussions/files`.

- **Uploads** are checked for size (25 MB maximum) and posted with the user's own chat account, optionally as a thread reply.
- **Downloads** use a URL carrying an HMAC signature over the chat group and file id. The service account can read every group's files, so the signature stops a URL listed for one group from working for another.
- The route authenticates the user and checks committee membership before either operation.

## Committee Discussions feature

The committee feature handler (`business-logic/hr/committee/discussions.ts`) connects committees to the module. A committee stores only `discussionsWorkspaceId`.

| Event | What happens |
|---|---|
| Feature enabled | Reuses the committee's previous workspace if it exists (restoring it if deleted), otherwise creates one. All current members who have a chat account are added. |
| Feature disabled | The workspace is archived. The id stays on the committee so a later enable restores the history. |
| Member added to the committee | Their user is added to the workspace. |
| Member removed from the committee | Their user is removed from the workspace. |
| Per-member access toggled | A committee manager (HR) or a coordinator of the committee can add or remove one member's access without changing committee membership. |

A committee member can only join if their person has an ERP user with a chat account. Members without one are skipped, and the member list shows who has login, chat and discussion access.

The GraphQL operations (`workspaceDiscussion*`, `workspaceSendDiscussionMessage`, and so on) take a `committeeId`. Each resolver only checks access, then calls the module and conversation functions.

## Data model

One collection owned by the module, `discussions-workspaces`:

| Field | Meaning |
|---|---|
| `_id` | The workspace id. This is what committees store. |
| `name` | Display name. |
| `chatGroupId` | The Rocket.Chat private group. **Internal to the module.** |
| `metadata` | Free-form data (the committee feature stores `committeeId`). |
| `createdAt`, `createdBy`, `updatedAt`, `updatedBy` | Standard. |
| `deletedAt`, `deletedBy` | Set while the workspace is archived. |

Not stored in the ERP: messages, reactions, pins, stars, threads and files (Rocket.Chat), and each user's chat token (kept on their ERP user, server-only, never returned through GraphQL).

## Notifications

**The Discussions module does not publish any notifications yet.** To be decided together; see [headless-module-notifications.md](headless-module-notifications.md) for how modules publish.

Two points already clear from how the module works:

- **Mentions are a candidate.** When a message is sent, a "mentioned you" notification could be published to each mentioned user. The message id would be the deterministic id, so republishing is harmless.
- **Unread counts are not.** A person's unread count lives in Rocket.Chat and changes with every message and every read, including reads the ERP never sees. It is live state. It is better served by a lookup in the Discussions API (shown as a badge) than by publishing and retiring a notification on each change.

A scheduled job in the module could also support things such as a reminder for a long-unanswered question, if that is wanted.

## Limits and constants

| Limit | Value |
|---|---|
| Message length | 5,000 characters |
| File size | 25 MB |
| Messages per page | 100 (initial load, older pages) |
| Search text | 200 characters; 50 results per page |
| Sync overlap | The `syncedAt` returned is 30 seconds before "now", to cover clock differences; re-delivered messages are merged by id. |

## Known limitations

- **One chat group per workspace.** The record stores a single `chatGroupId`. Supporting several groups per workspace would be a schema change.
- **Chat accounts are required to post**, and members need an ERP user with a chat account to be added at all.
- **Rocket.Chat availability.** Every message operation depends on the chat server. Failures are reported as `DISCUSSION_FAILED` errors with the reason.
- **No indexes** are defined for the workspaces collection yet.
- **Shared layer is not generic yet.** The conversation functions still carry discussion-flavoured wording in a few user-visible system messages (for example "Discussions were turned off").
- **Notifications** are not defined (see above).
