# Projects and Tasks

The projects module is a **headless backend module**. It stores projects and tasks in workspaces. A task has one assignee, an optional due date, a status, a priority and a progress value. It is either standalone or part of a project. A project has an objective, a list of participants and a set of tasks whose progress it summarises. The module has no GraphQL API, REST routes or UI of its own. A feature that needs projects calls its functions from its own resolvers or routes. The Workspaces **Projects & Tasks** committee feature is the first consumer (see [Committee Projects & Tasks feature](#committee-projects--tasks-feature)).

| Piece | Location |
|---|---|
| Public API (import from here) | `idreesia-common/server/business-logic/projects/` |
| Collections and document types | `idreesia-common/server/collections/projects/` |
| Schemas | `idreesia-common/server/schemas/projects/` |
| Constants (statuses, actions, limits) | `idreesia-common/constants/projects.ts` |
| Indexes | `idreesia-web/imports/startup/server/migrations/63-create-projects-indexes.ts` |

```ts
import {
  createProjectsWorkspace,
  createProject,
  createTask,
  setTaskProgress,
  listAssigneeTasks,
} from 'meteor/idreesia-common/server/business-logic/projects';
```

The module is server-only. Import from the barrel above, not from individual files inside it. It is independent of the [DMS](dms-design-and-usage.md), [Meetings](meetings-design-and-usage.md) and [Polls](polls-design-and-usage.md). They share no code or data.

## Responsibilities: caller vs. module

**The caller decides access.** The module never checks whether a user may see or change a workspace, project or task. Before calling it, the consuming feature must authenticate the user, check its own permissions, and make sure the ids it passes belong to what the user may touch (`project.workspaceId`, `task.workspaceId`).

**The module enforces integrity.** Whoever calls it, the module guarantees:
- **Status and progress rules hold** (see [Task status and progress](#task-status-and-progress)).
- **Closed projects are read-only.** Tasks of a completed or cancelled project can't be created, changed or moved.
- **Assignees are participants.** A task in a project can only be assigned to one of the project's participants.
- **Project statistics are right.** A project's task counts and progress are recomputed after every task change.
- **Concurrent edits don't overwrite each other.** Changes fail with `CONFLICT` if the record changed since it was read.

**Every function takes the acting `userId`**, reads included. It is recorded in `createdBy` / `updatedBy`, on comments, and in the activity log. A missing or empty `userId` fails with `BAD_USER_INPUT`.

**Participants, assignees and authors are opaque ids.** They are plain strings the caller chooses, typically karkun ids. The module never looks them up. (Comment authors are the acting `userId`.)

**Workspaces are independent.** A projects workspace has no link to ERP Workspaces (committees) or any other entity. The consuming feature stores the workspace id on its own records (for example `committee.projectsWorkspaceId`) and uses `metadata` for anything else it needs, for example a future link from a meeting action item.

**The module knows nothing about chat.** A project stores an opaque `chatGroupId` that the consumer sets with `setProjectChatGroupId`. Creating the group and keeping its members in step with `participantIds` is the consumer's job.

## Concepts

### Workspaces
A workspace is the top-level container: a name, an optional description and free-form `metadata`. Deleting a workspace is a soft delete. While it is deleted, every operation on its projects and tasks fails with `NOT_FOUND`. It can be restored, or purged, which removes everything permanently.

### Projects
A project has a title, an `objective` (what it is meant to achieve), a description, tags and metadata, optional start and target dates, an optional `participantIds` (at most 200).

| Status | Meaning |
|---|---|
| `planned` | Not started |
| `active` | In progress (the default for new projects) |
| `on-hold` | Paused |
| `completed` | Finished; tasks are read-only |
| `cancelled` | Dropped; tasks are read-only |

`setProjectStatus` moves a project to any other status. Completing a project with open tasks fails with `CONFLICT` (`extensions.openTasks`) unless `force` is set. Completing sets `completedAt`/`completedBy`; leaving `completed` clears them. A new project can't start as `completed` or `cancelled`.

`taskCount`, `doneCount` and `progress` on the project are derived from its tasks, not set by callers. Cancelled tasks are left out. `progress` (0-100) is the average of the counted tasks' progress, and 0 when there are none.

**Participants.** `addProjectParticipants` adds ids. `removeProjectParticipant` fails with `CONFLICT` for a person with open tasks in the project, unless `unassignTasks` is set, which unassigns those tasks.

**Deleting.** `deleteProject` is permanent. Its tasks become standalone (`tasks: 'detach'`, the default) or are deleted with their comments (`tasks: 'delete'`). Activity entries are kept.

### Tasks
A task has a title, description, one optional `assigneeId`, an optional `dueDate`, a status, a priority (`low`, `normal` (default), `high`, `urgent`), a progress value, tags and metadata. It is standalone, or belongs to one project in the same workspace. New tasks start as `todo`.

### Task status and progress

| Status | Meaning |
|---|---|
| `todo` | Not started |
| `in-progress` | Being worked on |
| `blocked` | Waiting on something |
| `done` | Finished: progress 100, `completedAt`/`completedBy` set |
| `cancelled` | Won't be done (leaves project statistics) |

- `setTaskStatus` moves between any two statuses. `done` sets progress to 100. Leaving `done` clears the completion fields and resets progress to 0 for `todo`, otherwise to at most 99.
- `setTaskProgress` (0-100, whole numbers) works on open tasks only (`todo`, `in-progress`, `blocked`). Progress above 0 on a `todo` task makes it `in-progress`; 100 makes it `done`.
- **Overdue** is computed when reading, never stored: the task is open and `dueDate` has passed (`isTaskOverdue(task)`). The `overdue` list filter does the same in the query. No background job runs.

### Comments
`addTaskComment` adds a comment (up to 5,000 characters) to a task; the acting user is the author. `deleteTaskComment` removes one. The caller decides who may delete whose comment. `commentCount` on the task is kept up to date.

### Text fields
Titles are trimmed, runs of whitespace are collapsed, and control characters are rejected (255 characters at most). Descriptions, objectives and comments are trimmed and limited. Tags are lower-cased and de-duplicated (at most 50 of up to 64 characters). Metadata keys use letters, digits, `_` and `-` only.

## Errors

Every failure is a `GraphQLError` with `extensions.code`, so a GraphQL resolver can let it propagate unchanged. A REST route should map the codes to HTTP statuses:

| `extensions.code` | Meaning | Suggested HTTP |
|---|---|---|
| `NOT_FOUND` | No such workspace, project, task or comment. Also returned when the workspace is deleted. | 404 |
| `CONFLICT` | Closed project; assignee not a participant; completing a project with open tasks; removing a person with open tasks; progress on a task that isn't open; concurrent change ("reload and try again"); restoring a workspace that isn't deleted or purging one that is | 409 |
| `BAD_USER_INPUT` | Invalid title, date, status, priority, progress, tags, metadata or ids | 400 |

Map any other error to a 500.

## Paging

Paged lists return `{ data, totalResults }` (`ProjectsPage<T>`) and accept `skip` (default `0`) and `limit` (default `50`, capped at `200`).

## API reference

Every function is `async`. Document types are exported from `collections/projects`: `ProjectsWorkspaceDocument`, `ProjectDocument`, `ProjectTaskDocument`, `ProjectCommentDocument` and `ProjectsActivityDocument`. Dates can be passed as `Date`, ISO strings or epoch milliseconds. For optional fields in update functions, `undefined` leaves the field as it is and `null` clears it.

### Workspaces

Workspace functions carry a `Projects` prefix, so a feature can import them next to those of the other headless modules.

| Function | Returns | Notes |
|---|---|---|
| `createProjectsWorkspace({ name, description?, metadata? }, userId)` | workspace | |
| `updateProjectsWorkspace(workspaceId, { name?, description?, metadata? }, userId)` | workspace | `metadata` replaces the whole object |
| `getProjectsWorkspace(workspaceId, userId, { includeDeleted? })` | workspace | |
| `listProjectsWorkspaces(userId, { workspaceIds?, nameContains?, includeDeleted?, onlyDeleted?, skip?, limit? })` | `ProjectsPage<workspace>` | |
| `deleteProjectsWorkspace(workspaceId, userId)` | – | Soft delete |
| `restoreProjectsWorkspace(workspaceId, userId)` | workspace | |
| `purgeProjectsWorkspace(workspaceId, userId)` | – | Only a deleted workspace. Removes projects, tasks, comments and activity. |

### Projects

| Function | Returns | Notes |
|---|---|---|
| `createProject({ workspaceId, title, objective?, description?, status?, participantIds?, startDate?, targetDate?, tags?, metadata? }, userId)` | project | |
| `getProject(projectId, userId)` | project | |
| `updateProject(projectId, { title?, objective?, description?, startDate?, targetDate?, tags?, metadata? }, userId)` | project | The target date can't be before the start date. |
| `setProjectStatus(projectId, status, userId, { force? })` | project | |
| `addProjectParticipants(projectId, ids, userId)` | project | |
| `removeProjectParticipant(projectId, id, userId, { unassignTasks? })` | project | |
| `setProjectChatGroupId(projectId, chatGroupId \| null, userId)` | project | Opaque; for the consumer's chat group |
| `deleteProject(projectId, userId, { tasks? })` | – | `'detach'` (default) or `'delete'` |
| `listProjects(workspaceId, userId, options)` | `ProjectsPage<project>` | See below |
| `listParticipantProjects(participantId, userId, { workspaceIds?, ...options })` | `ProjectsPage<project>` | Across workspaces. Pass the `workspaceIds` your feature authorised. Deleted workspaces are always left out. |

**List options:** `status` (one or a list), `participantId`, `tags` (all of them), `metadata` (`{ key: value }`, exact top-level match), `text` (whole words in title, objective, description and tags; no stemming, no partial words), `sortBy` (`createdAt` (default), `targetDate` or `title`), `sortOrder`, `skip`, `limit`.

### Tasks

| Function | Returns | Notes |
|---|---|---|
| `createTask({ workspaceId, projectId?, title, description?, assigneeId?, dueDate?, priority?, tags?, metadata? }, userId)` | task | Standalone, or in an open project |
| `getTask(taskId, userId)` | task | |
| `updateTask(taskId, { title?, description?, assigneeId?, dueDate?, priority?, tags?, metadata? }, userId)` | task | `assigneeId: null` unassigns |
| `setTaskStatus(taskId, status, userId)` | task | |
| `setTaskProgress(taskId, progress, userId)` | task | |
| `deleteTask(taskId, userId)` | – | Removes its comments; keeps its activity |
| `listTasks(workspaceId, userId, options)` | `ProjectsPage<task>` | See below |
| `listAssigneeTasks(assigneeId, userId, { workspaceIds?, ...options })` | `ProjectsPage<task>` | "My tasks", across workspaces. Defaults to open tasks. |
| `isTaskOverdue(task)` | boolean | |

**List options** (both list functions): `status` (one or a list), `priority`, `overdue`, `dueAfter`, `dueBefore`, `tags`, `metadata`, `sortBy` (`dueDate` (default; tasks without one last), `createdAt`, `priority` or `title`), `sortOrder`, `skip`, `limit`. `listTasks` also takes `projectId`, `standalone`, `assigneeId`, `unassigned` and `text`.

### Comments

| Function | Returns | Notes |
|---|---|---|
| `addTaskComment(taskId, text, userId)` | comment | The acting user is the author |
| `getTaskComment(commentId, userId)` | comment | |
| `deleteTaskComment(commentId, userId)` | – | |
| `listTaskComments(taskId, userId, { skip?, limit? })` | `ProjectsPage<comment>` | Oldest first |

### Activity log

`listProjectsActivity(workspaceId, userId, { projectId?, taskId?, before?, limit? })` returns entries newest first, and works on deleted workspaces too. To page, pass the last entry's `at` as `before`. Entry shape: `{ workspaceId, projectId?, taskId?, entityType, entityId, action, userId, at, details? }`. `entityType` is `workspace`, `project`, `task` or `comment`. Entries never contain comment text. The `action` values are `ProjectsAction` in `constants/projects.ts`:

| Area | Actions |
|---|---|
| Workspace | `workspace-created`, `workspace-updated`, `workspace-deleted`, `workspace-restored` |
| Project | `project-created`, `project-updated`, `project-status-changed`, `participants-added`, `participant-removed`, `project-deleted` |
| Task | `task-created`, `task-updated`, `task-assigned`, `task-status-changed`, `task-progress-changed`, `task-deleted` |
| Comment | `comment-added`, `comment-deleted` |

## Data model

| Collection | Holds |
|---|---|
| `projects-workspaces` | name, description, metadata, timestamps, `deletedAt`/`deletedBy` |
| `projects` | `workspaceId`, title, objective, description, status, `participantIds[]`, dates, tags, metadata, `chatGroupId?`, `taskCount`/`doneCount`/`progress`, `completedAt`/`completedBy`, `revision`, timestamps |
| `project-tasks` | `workspaceId`, `projectId?`, title, description, `assigneeId?`, `dueDate?`, status, priority, progress, tags, metadata, `completedAt`/`completedBy`, `commentCount`, `revision`, timestamps |
| `project-comments` | `workspaceId`, `taskId`, `authorId`, text, timestamps |
| `projects-activities` | see [Activity log](#activity-log) |

Change this data only through the API. Writing to the collections directly bypasses validation, status rules, project statistics and the activity log. `revision` goes up on every change to a project or task, and edits use it to detect concurrent changes.

## Committee Projects & Tasks feature

The Workspaces module uses projects through the **Projects & Tasks** committee feature (`CommitteeFeatureKeys.PROJECTS`):

| Piece | Location |
|---|---|
| Feature handler, workspace lookup, leaving-member cleanup | `idreesia-common/server/business-logic/hr/committee/projects.ts` |
| Project chat groups | `.../hr/committee/projects-chat.ts` |
| View mapping (names, timestamps as strings) | `.../hr/committee/projects-view.ts` |
| Multi-step changes and input mapping | `.../hr/committee/projects-actions.ts` |
| GraphQL schema, access checks, resolvers | `idreesia-common/server/graphql-api/workspaces/projects/` |
| Project chat file routes | `idreesia-web/imports/startup/server/setup-workspace-discussion-endpoints.ts` (the `/projects/:projectId/discussions/files` routes) |
| Web UI | `idreesia-web/imports/ui/modules/common/projects/` (reusable) and `.../modules/workspaces/projects/` (committee pages) |
| Mobile UI | `idreesia-mobile/imports/ui/workspaces/projects/` |

**Feature lifecycle:**
- Enabling the feature creates a `"<committee> Projects"` workspace with `metadata.committeeId`, and stores its id in `committee.projectsWorkspaceId`.
- Disabling it archives every project's chat group, then soft-deletes the workspace.
- Enabling it again restores the same workspace, with its projects and tasks, and unarchives the chat groups of open projects.
- When a person leaves the committee they leave every project: they stop being a participant, lose chat access, and their open tasks are unassigned.

**Who can do what:**
- **Coordinators** (and `erp-admin`) create, edit and delete projects and tasks, change project status, manage participants and see the activity log.
- A task's **assignee** changes the status and progress of their own task.
- **Every member** sees all projects and tasks and can comment on any task. Comments can be deleted by their author or a coordinator.
- Participants and assignees must be committee members. Assigning a project task to a member who isn't a participant makes them one.

### Project chat

Each project gets a private chat (a Rocket.Chat private group, named `project-<committee>-<title>-<id>`) for its participants:
- The group is created with the project. If chat is unreachable at that moment, it is created the first time a participant opens the project's chat.
- Group members are the participants who have a chat account (same rule as committee Discussions). Adding or removing a participant adds or removes their chat access.
- **Access is for participants only.** Coordinators and `erp-admin` get no automatic access; they can add themselves as participants. Pinning messages is for coordinators.
- Completing or cancelling the project archives the group (history is kept). Setting the status back to an open one unarchives it. Deleting a project archives its group.
- Messages, reactions, pins, search and files reuse the committee Discussions business logic (`server/business-logic/discussions/`), and messages are posted as each user.

## Integrating another feature

**Checklist for a new consumer:**
1. Create a projects workspace for each owning entity and store its id on that entity.
2. Before every call, check that the user may act on that workspace. When the caller passes a project or task id, also check that it belongs to the workspace you authorised.
3. Decide who may create, edit and delete projects and tasks, who may change a task's status and progress, and who may purge workspaces. The module doesn't restrict them.
4. If projects need a chat or a participant-based permission model, keep `participantIds` and your chat group in step yourself.

## Limits and constants

All of these are in `idreesia-common/constants/projects.ts`:

| Constant | Value |
|---|---|
| `PROJECTS_DEFAULT_PAGE_SIZE` / `PROJECTS_MAX_PAGE_SIZE` | 50 / 200 |
| `PROJECTS_MAX_TITLE_LENGTH` | 255 |
| `PROJECTS_MAX_COMMENT_LENGTH` | 5,000 |
| `PROJECTS_MAX_PARTICIPANTS` | 200 per project |

## Known limitations

- **No notifications or reminders.** The consuming feature tells assignees about new, due or overdue tasks itself.
- **No attachments, checklists, sub-tasks or dependencies.** Tasks are flat. Progress is a single number.
- **Project progress is an unweighted average** of its counted tasks.
- **Multi-step operations are not transactional.** For example, deleting a project detaches its tasks before removing it, and project statistics are recomputed after the task write, so a crash in between can leave them stale until the project's next task change.
- **Chat access follows participants only through the committee layer.** Someone changing `participantIds` through the module directly won't update the chat group.
