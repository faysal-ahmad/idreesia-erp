/**
 * Constants for the headless polls module
 * (server/business-logic/polls).
 */

/** The module's name as a headless module (notifications are keyed by it). */
export const POLLS_MODULE = 'polls';

export const PollStatus = {
  /** Being prepared: questions can change, no voting yet. */
  DRAFT: 'draft',
  /** Accepting votes until `closesAt`. */
  OPEN: 'open',
  /** Past its end time, or closed early. Results are final. */
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;
export type PollStatusValue = (typeof PollStatus)[keyof typeof PollStatus];

export const PollQuestionType = {
  /** Exactly one option. */
  SINGLE: 'single',
  /** Between minChoices and maxChoices options. */
  MULTIPLE: 'multiple',
} as const;
export type PollQuestionTypeValue =
  (typeof PollQuestionType)[keyof typeof PollQuestionType];

export const PollsEntityType = {
  WORKSPACE: 'workspace',
  POLL: 'poll',
  VOTE: 'vote',
} as const;
export type PollsEntityTypeValue =
  (typeof PollsEntityType)[keyof typeof PollsEntityType];

export const PollsAction = {
  WORKSPACE_CREATED: 'workspace-created',
  WORKSPACE_UPDATED: 'workspace-updated',
  WORKSPACE_DELETED: 'workspace-deleted',
  WORKSPACE_RESTORED: 'workspace-restored',

  POLL_CREATED: 'poll-created',
  POLL_UPDATED: 'poll-updated',
  QUESTIONS_UPDATED: 'questions-updated',
  POLL_OPENED: 'poll-opened',
  POLL_CLOSED: 'poll-closed',
  POLL_REOPENED: 'poll-reopened',
  POLL_CANCELLED: 'poll-cancelled',
  POLL_DELETED: 'poll-deleted',

  VOTE_CAST: 'vote-cast',
  VOTE_CHANGED: 'vote-changed',
  VOTE_WITHDRAWN: 'vote-withdrawn',
} as const;
export type PollsActionValue = (typeof PollsAction)[keyof typeof PollsAction];

export const POLLS_DEFAULT_PAGE_SIZE = 50;
export const POLLS_MAX_PAGE_SIZE = 200;
export const POLLS_MAX_TITLE_LENGTH = 255;
export const POLLS_MAX_QUESTION_LENGTH = 1000;
export const POLLS_MAX_QUESTIONS = 50;
export const POLLS_MIN_OPTIONS = 2;
export const POLLS_MAX_OPTIONS = 50;
