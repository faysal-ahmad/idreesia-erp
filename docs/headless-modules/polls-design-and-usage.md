# Polls

The polls module is a **headless backend module**. It stores polls in workspaces. A poll has one or more single- or multiple-choice questions, an end time, an optional list of eligible voters, and anonymous or named voting. Results become available once the poll closes. The module has no GraphQL API, REST routes or UI of its own. A feature that needs polls calls its functions from its own resolvers or routes. The Workspaces **Polls** committee feature is the first consumer (see [Committee Polls feature](#committee-polls-feature)).

| Piece | Location |
|---|---|
| Public API (import from here) | `idreesia-common/server/business-logic/polls/` |
| Collections and document types | `idreesia-common/server/collections/polls/` |
| Schemas | `idreesia-common/server/schemas/polls/` |
| Constants (statuses, actions, limits) | `idreesia-common/constants/polls.ts` |
| Indexes | `idreesia-web/imports/startup/server/migrations/62-create-polls-indexes.ts` |

```ts
import {
  createPollsWorkspace,
  createPoll,
  openPoll,
  castVote,
  getPollResults,
} from 'meteor/idreesia-common/server/business-logic/polls';
```

The module is server-only. Import from the barrel above, not from individual files inside it. It is independent of the [DMS](dms-design-and-usage.md) and of [Meetings](meetings-design-and-usage.md). They share no code or data.

## Responsibilities: caller vs. module

**The caller decides access.** The module never checks whether a user may see or change a workspace or poll, or vote as a given voter. Before calling it, the consuming feature must:
- authenticate the user,
- check its own permissions (for example "is this user a member of the committee that owns this workspace"),
- make sure the ids it passes belong to what the user may touch (`poll.workspaceId`),
- and only pass a `voterId` the user may vote as (normally their own).

**The module enforces integrity.** Whoever calls it, the module guarantees:
- **Status rules hold** (see [Poll status](#poll-status)).
- **No votes after the end time**, even if nobody has looked at the poll since.
- **Eligibility.** If a poll lists eligible voters, only they can vote (`FORBIDDEN` otherwise).
- **Valid ballots.** Every required question is answered, options belong to their question, and the number of choices fits the question.
- **One ballot per voter.** Voting again replaces the earlier vote (a unique index backs this).
- **Anonymity.** An anonymous poll's results and API never say who voted for what (see [Anonymity](#anonymity)).
- **Concurrent edits don't overwrite each other.** Changes fail with `CONFLICT` if the poll changed since it was read.

**Every function takes the acting `userId`**, reads included. It is recorded in `createdBy` / `updatedBy`, on ballots, and in the activity log. A missing or empty `userId` fails with `BAD_USER_INPUT`. `userId` (who is acting) and `voterId` (whose vote it is) are separate. When a member votes for themselves, the caller passes both.

**Voters are opaque ids.** A voter id is a plain string the caller chooses, typically a karkun id. The module never looks it up.

**Workspaces are independent.** A polls workspace has no link to ERP Workspaces (committees) or any other entity. The consuming feature stores the workspace id on its own records (for example `committee.pollsWorkspaceId`) and uses `metadata` for anything else it needs.

## Concepts

### Workspaces
A workspace is the top-level container. It has a name, an optional description and free-form `metadata`.

Deleting a workspace is a soft delete. While it is deleted, every operation on its polls fails with `NOT_FOUND`. It can be restored, or purged, which removes everything permanently.

### Polls
A poll has a title, an optional description, tags, metadata and an end time (`closesAt`, stored in UTC). It also has two settings:
- `anonymous`, default `false`
- `showResultsWhileOpen`, default `false`

New polls start as drafts.

### Poll status

| Status | Meaning | What can change |
|---|---|---|
| `draft` | Being prepared; nobody can vote | Everything |
| `open` | Accepting votes until `closesAt` | Title, description, tags, metadata, `closesAt` (must stay in the future), `showResultsWhileOpen`, and adding eligible voters. Not the questions or `anonymous`. |
| `closed` | Voting has ended; results are final | Nothing, until it is reopened. It can still be deleted. |
| `cancelled` | Won't run | Nothing. It can still be deleted. |

These transitions are available:

| Function | Change | Notes |
|---|---|---|
| `openPoll` | draft → open | Needs at least one question, each with at least 2 options, and an end time in the future. |
| `closePoll` | open → closed | Closes early. Sets `closedBy`. |
| `reopenPoll` | closed → open | Takes a new future end time. Votes are kept. |
| `cancelPoll` | draft or open → cancelled | |

Anything else fails with `CONFLICT`, with `extensions.status` giving the current status.

**Automatic close.** An open poll whose `closesAt` has passed becomes `closed`, with `closedAt = closesAt` and no `closedBy`. No background job does this. Every read or write of polls first settles expired polls with one indexed update, so callers always see the right status. Votes are refused once `closesAt` passes, even before settling. Automatic closes are not written to the activity log, because no user acted.

### Questions
A poll has up to 50 questions, shown in order. Each question has:
- `text` (up to 1,000 characters)
- an optional `description`
- `type`: `single` (exactly one option) or `multiple`
- `required` (default `true`)
- 2 to 50 options of up to 255 characters, with no duplicate texts in a question (case-insensitive)

A `multiple` question can also set `minChoices` (default 1) and `maxChoices` (default: every option). An unanswered optional question is simply left out of the ballot.

Questions can only change while the poll is a draft, so every ballot matches the questions it was cast against. `setPollQuestions` replaces the whole list. Question and option ids are generated by the module. Pass an existing `_id` back to keep it. Unknown ids are replaced with new ones.

### Eligible voters
`eligibleVoterIds` is optional. A non-empty list restricts voting to those ids, and the results then report turnout and, for named polls, who didn't vote. Without a list, or with an empty one, anyone the caller lets through can vote. The list can be replaced while the poll is a draft. While it is open, voters can only be added (`addEligibleVoters`). At most 5,000 ids.

### Votes
`castVote` records a voter's answers, replacing their earlier vote, while the poll is open. `withdrawVote` removes it. `getVote` returns a voter's own ballot (or `null`), for any poll, anonymous ones included: it is the caller's job to show it only to that voter. `voteCount` on the poll is the number of ballots.

### Anonymity
Anonymity here means **hidden identity**. A ballot stores its `voterId`, which is how votes can be changed and counted once. The module never reveals it for an anonymous poll:
- `getPollResults` returns counts only: no `voterIds` per option and no `nonVoterIds`.
- `listBallots` fails with `FORBIDDEN`.
- Votes on anonymous polls are not written to the activity log, so the log can't show who took part.

Anyone with direct database access can still connect ballots to voters. `anonymous` can only change while the poll is a draft.

### Results
`getPollResults` works on a closed poll, or on an open one with `showResultsWhileOpen`. Otherwise it fails with `CONFLICT`. Each option's `percentage` is of the voters who answered that question (`answeredCount`), so the percentages of a multiple-choice question can add up to more than 100.

### Text fields
Titles, question and option texts are trimmed, runs of whitespace are collapsed, and control characters are rejected. Descriptions are trimmed and limited to 10,000 characters. Tags are lower-cased and de-duplicated, with at most 50 tags of up to 64 characters each. Metadata keys use letters, digits, `_` and `-` only.

## Errors

Every failure is a `GraphQLError` with `extensions.code`, so a GraphQL resolver can let it propagate unchanged. A REST route should map the codes to HTTP statuses:

| `extensions.code` | Meaning | Suggested HTTP |
|---|---|---|
| `NOT_FOUND` | No such workspace or poll, or no vote to withdraw. Also returned when the workspace is deleted. | 404 |
| `CONFLICT` | Not allowed in the poll's status (including voting after the end time and results before close); poll not ready to open; concurrent change ("reload and try again"); restoring a workspace that isn't deleted or purging one that is | 409 |
| `BAD_USER_INPUT` | Invalid title, time, question, option, answer, tags or metadata | 400 |
| `FORBIDDEN` | The voter isn't eligible; listing an anonymous poll's ballots | 403 |

Map any other error to a 500.

## Paging

Paged lists return `{ data, totalResults }` (`PollsPage<T>`) and accept `skip` (default `0`) and `limit` (default `50`, capped at `200`).

## API reference

Every function is `async`. Document types are exported from `collections/polls`: `PollsWorkspaceDocument`, `PollDocument`, `PollBallotDocument` and `PollsActivityDocument`. Dates can be passed as `Date`, ISO strings or epoch milliseconds. For optional fields in update functions, `undefined` leaves the field as it is and `null` clears it.

### Workspaces

Workspace functions carry a `Polls` prefix, so a feature can import them next to the DMS's and Meetings'.

| Function | Returns | Notes |
|---|---|---|
| `createPollsWorkspace({ name, description?, metadata? }, userId)` | workspace | |
| `updatePollsWorkspace(workspaceId, { name?, description?, metadata? }, userId)` | workspace | `metadata` replaces the whole object |
| `getPollsWorkspace(workspaceId, userId, { includeDeleted? })` | workspace | |
| `listPollsWorkspaces(userId, { workspaceIds?, nameContains?, includeDeleted?, onlyDeleted?, skip?, limit? })` | `PollsPage<workspace>` | |
| `deletePollsWorkspace(workspaceId, userId)` | – | Soft delete |
| `restorePollsWorkspace(workspaceId, userId)` | workspace | |
| `purgePollsWorkspace(workspaceId, userId)` | – | Only a deleted workspace. Removes polls, ballots and activity. |

### Polls

| Function | Returns | Notes |
|---|---|---|
| `createPoll({ workspaceId, title, closesAt, description?, anonymous?, showResultsWhileOpen?, tags?, metadata?, eligibleVoterIds?, questions? }, userId)` | poll | Starts as a draft |
| `getPoll(pollId, userId)` | poll | |
| `updatePoll(pollId, { title?, description?, closesAt?, anonymous?, showResultsWhileOpen?, tags?, metadata?, eligibleVoterIds? }, userId)` | poll | Draft or open. `anonymous` and `eligibleVoterIds` are draft-only. |
| `setPollQuestions(pollId, questions, userId)` | poll | Draft only. Replaces the list. |
| `addEligibleVoters(pollId, voterIds, userId)` | poll | Draft or open; only for polls that have a list |
| `openPoll(pollId, userId, { closesAt? })` | poll | Draft → open |
| `closePoll(pollId, userId)` | poll | Open → closed, early |
| `reopenPoll(pollId, { closesAt }, userId)` | poll | Closed → open |
| `cancelPoll(pollId, userId, { reason? })` | poll | Draft or open → cancelled |
| `deletePoll(pollId, userId)` | – | Permanent. Removes its ballots; keeps its activity entries. |
| `listPolls(workspaceId, userId, options)` | `PollsPage<poll>` | See below |
| `listVoterPolls(voterId, userId, { workspaceIds?, voted?, ...filters })` | `PollsPage<poll>` | Polls the voter can vote in (on the list, or no list), across workspaces. Pass the `workspaceIds` your feature authorised. Deleted workspaces are always left out. Defaults to open and closed polls. `voted: true/false` keeps only polls they have or haven't voted in. |

**Question input:** `{ _id?, text, description?, type?, required?, minChoices?, maxChoices?, options: [{ _id?, text }] }`.

**List filters** (both list functions):
- `status` (one or a list)
- `closesAfter`, `closesBefore`
- `tags` (all of them)
- `metadata` (`{ key: value }`, exact top-level match)
- `sortBy` (`closesAt`, the default, or `createdAt`)
- `sortOrder` (`asc`, the default, or `desc`)
- `skip`, `limit`

`listPolls` also takes `text`, which matches whole words in the title, description and tags. There is no stemming and no partial-word matching.

### Votes

| Function | Returns | Notes |
|---|---|---|
| `castVote(pollId, voterId, [{ questionId, optionIds }], userId)` | `{ ballot, isNew }` | Open polls before their end time. Replaces an earlier vote. |
| `withdrawVote(pollId, voterId, userId)` | – | Open polls only |
| `getVote(pollId, voterId, userId)` | ballot or `null` | Any poll; anonymous ones too |
| `listBallots(pollId, userId, { skip?, limit? })` | `PollsPage<ballot>` | Named polls only, oldest first |

### Results

`getPollResults(pollId, userId)` returns:

```ts
{
  pollId, status, anonymous, closedAt?,
  totalVoters,            // ballots
  eligibleCount?, turnout?, // with an eligible list; turnout is 0-100
  nonVoterIds?,           // named polls with a list
  questions: [{
    questionId, text, type, answeredCount,
    options: [{ optionId, text, count, percentage, voterIds? /* named polls */ }],
  }],
}
```

`canSeeResults(poll)` tells you, without a query, whether results can be read now.

### Activity log

`listPollsActivity(workspaceId, userId, { pollId?, entityId?, before?, limit? })` returns entries newest first, and works on deleted workspaces too. To page, pass the last entry's `at` as `before`. Entry shape: `{ workspaceId, pollId?, entityType, entityId, action, userId, at, details? }`. `entityType` is `workspace`, `poll` or `vote`. Entries never contain answers. The `action` values are `PollsAction` in `constants/polls.ts`:

| Area | Actions |
|---|---|
| Workspace | `workspace-created`, `workspace-updated`, `workspace-deleted`, `workspace-restored` |
| Poll | `poll-created`, `poll-updated`, `questions-updated`, `voters-added`, `poll-opened`, `poll-closed`, `poll-reopened`, `poll-cancelled`, `poll-deleted` |
| Votes (named polls only) | `vote-cast`, `vote-changed`, `vote-withdrawn` |

## Data model

| Collection | Holds |
|---|---|
| `polls-workspaces` | name, description, metadata, timestamps, `deletedAt`/`deletedBy` |
| `polls` | `workspaceId`, title, description, tags, metadata, `anonymous`, `showResultsWhileOpen`, `eligibleVoterIds?`, embedded `questions[]` with their `options[]`, `closesAt`, `status` with opening/closing/cancellation fields, `voteCount`, `revision`, timestamps |
| `polls-ballots` | `workspaceId`, `pollId`, `voterId`, `answers[]` (`{ questionId, optionIds[] }`), timestamps. Unique on `(pollId, voterId)`. |
| `polls-activities` | see [Activity log](#activity-log) |

Change this data only through the API. Writing to the collections directly bypasses validation, status rules, the vote count and the activity log. `revision` goes up on every change to a poll, and edits use it to detect concurrent changes.

## Committee Polls feature

The Workspaces module uses polls through the **Polls** committee feature (`CommitteeFeatureKeys.POLLS`):

| Piece | Location |
|---|---|
| Feature handler, workspace lookup | `idreesia-common/server/business-logic/hr/committee/polls.ts` |
| View mapping (names, timestamps as strings) | `.../hr/committee/polls-view.ts` |
| Form input mapping | `.../hr/committee/polls-actions.ts` |
| GraphQL schema, access checks, resolvers | `idreesia-common/server/graphql-api/workspaces/polls/` |
| Reusable UI (no committee knowledge; driven by a `PollsDataProvider`) | `idreesia-web/imports/ui/modules/common/polls/` |
| Committee pages and data provider | `idreesia-web/imports/ui/modules/workspaces/polls/` |
| Mobile app screens (Home → workspace → Polls) | `idreesia-mobile/imports/ui/workspaces/polls/` |

**Feature lifecycle:**
- Enabling the feature creates a `"<committee> Polls"` workspace with `metadata.committeeId`, and stores its id in `committee.pollsWorkspaceId`.
- Disabling it soft-deletes the workspace.
- Enabling it again restores the same workspace, with its polls.

**Who can do what:**
- **Coordinators** (and `erp-admin`) create, edit, open, close, reopen, cancel and delete polls. They see drafts, the Voters tab and the Activity tab.
- **Members** see polls that aren't drafts, vote as themselves (voter id = their karkun id), and see results when the module allows it.
- Eligible voters must be committee members. A poll created without a voter list gets every current member. Members who join later can be added from the Voters tab.
- A user who isn't a committee member (for example `erp-admin` without membership) can view polls but can't vote.

## Integrating another feature

**Checklist for a new consumer:**
1. Create a polls workspace for each owning entity and store its id on that entity.
2. Before every call, check that the user may act on that workspace. When the caller passes a poll id, also check that it belongs to the workspace you authorised, and hide drafts from users who shouldn't see them.
3. Only pass a `voterId` the user may vote as.
4. Decide who may create, close, reopen, cancel and delete polls and purge workspaces. The module doesn't restrict them.

## Limits and constants

All of these are in `idreesia-common/constants/polls.ts`:

| Constant | Value |
|---|---|
| `POLLS_DEFAULT_PAGE_SIZE` / `POLLS_MAX_PAGE_SIZE` | 50 / 200 |
| `POLLS_MAX_TITLE_LENGTH` | 255 (titles and option texts) |
| `POLLS_MAX_QUESTION_LENGTH` | 1,000 |
| `POLLS_MAX_QUESTIONS` | 50 |
| `POLLS_MIN_OPTIONS` / `POLLS_MAX_OPTIONS` | 2 / 50 per question |
| `POLLS_MAX_ELIGIBLE_VOTERS` | 5,000 |

## Known limitations

- **No notifications or reminders.** The consuming feature tells voters about new or closing polls itself.
- **Automatic closes aren't logged.** A poll that closed at its end time has `closedAt` but no `closedBy` and no activity entry.
- **Anonymity is at the API level.** Ballots keep the voter id so votes can be changed. Someone with database access can see who voted for what.
- **Only choice questions.** There are no free-text, ranking or rating questions.
- **Multi-step operations are not transactional.** For example, a deleted poll's ballots are removed before the poll itself. The vote count is updated after a ballot is written, so a crash in between can leave it off by one.
