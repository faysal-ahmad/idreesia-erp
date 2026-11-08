/**
 * Headless polls module: workspaces of polls with several single- or
 * multiple-choice questions, an end time, optional eligible voters,
 * anonymous or named voting, and results once the poll closes.
 *
 * Callers enforce access - nothing here checks whether a user may see or
 * change a workspace or poll, or vote as a voter. Every function takes the
 * acting user's id, which is recorded on changes and in the activity log.
 * Voter ids are opaque to the module. The module enforces its own rules:
 * poll state transitions, the end time, eligibility, valid answers, and
 * never naming voters of an anonymous poll. Errors are GraphQLErrors with an
 * `extensions.code` (see PollsErrorCode).
 */
export type { PollsErrorCode } from './errors';
export type { PollsPage, PollsPageOptions, PollsSortOrder } from './internal';

export { listPollsActivity } from './activity';
export type { ListPollsActivityOptions } from './activity';

export {
  createPollsWorkspace,
  updatePollsWorkspace,
  getPollsWorkspace,
  listPollsWorkspaces,
  deletePollsWorkspace,
  restorePollsWorkspace,
  purgePollsWorkspace,
} from './workspaces';
export type {
  CreatePollsWorkspaceInput,
  UpdatePollsWorkspaceInput,
  ListPollsWorkspacesOptions,
} from './workspaces';

export {
  createPoll,
  getPoll,
  updatePoll,
  addEligibleVoters,
  openPoll,
  closePoll,
  reopenPoll,
  cancelPoll,
  deletePoll,
  listPolls,
  listVoterPolls,
} from './polls';
export type {
  CreatePollInput,
  UpdatePollInput,
  ListPollsOptions,
  ListVoterPollsOptions,
} from './polls';

export { setPollQuestions } from './questions';
export type { PollQuestionInput, PollOptionInput } from './questions';

export { castVote, withdrawVote, getVote, listBallots } from './votes';
export type { PollAnswerInput } from './votes';

export { getPollResults, canSeeResults } from './results';
export type {
  PollResults,
  PollQuestionResult,
  PollOptionResult,
} from './results';
