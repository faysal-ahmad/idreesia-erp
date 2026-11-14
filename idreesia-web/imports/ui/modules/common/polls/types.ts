/**
 * The polls UI is reusable: it knows nothing about committees or any other
 * host. Each place that shows polls supplies a data provider implementing
 * `PollsDataProvider`.
 *
 * Timestamps are milliseconds since the epoch, as strings. Voter ids are
 * whatever the host uses for its members.
 */

export type PollStatus = 'draft' | 'open' | 'closed' | 'cancelled';
export type PollQuestionType = 'single' | 'multiple';
/** Which polls a list shows. */
export type PollsView = 'open' | 'closed' | 'drafts' | 'all';

export interface PollsInfo {
  /** The current user can create and manage polls. */
  canManage: boolean;
  /** The current user's voter id, if they can vote. */
  myVoterId: string | null;
}

export interface PollOption {
  _id: string;
  text: string;
}

export interface PollQuestion {
  _id: string;
  text: string;
  description: string | null;
  type: PollQuestionType;
  required: boolean;
  minChoices: number | null;
  maxChoices: number | null;
  options: PollOption[];
}

export interface PollAnswer {
  questionId: string;
  optionIds: string[];
}

export interface Poll {
  _id: string;
  title: string;
  description: string | null;
  status: PollStatus;
  anonymous: boolean;
  closesAt: string;
  openedAt: string | null;
  closedAt: string | null;
  /** Empty when the poll closed on its own at its end time. */
  closedByName: string | null;
  cancelledAt: string | null;
  cancelledByName: string | null;
  cancellationReason: string | null;
  questions: PollQuestion[];
  voteCount: number;
  /** The current user can vote in it. */
  isEligible: boolean;
  hasVoted: boolean;
  /** The current user's answers, if they have voted. */
  myAnswers: PollAnswer[] | null;
  canSeeResults: boolean;
  createdAt: string | null;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByName: string | null;
}

export interface PollPage {
  polls: Poll[];
  totalResults: number;
}

export interface PollsQuery {
  view: PollsView;
  text?: string;
  pageIndex: number;
  pageSize: number;
}

export interface PollOptionInput {
  /** Set for an existing option, to keep it. */
  _id?: string | null;
  text: string;
}

export interface PollQuestionInput {
  /** Set for an existing question, to keep it. */
  _id?: string | null;
  text: string;
  description?: string | null;
  type: PollQuestionType;
  required: boolean;
  minChoices?: number | null;
  maxChoices?: number | null;
  options: PollOptionInput[];
}

/** What the create / edit form saves. */
export interface PollDetails {
  title: string;
  description: string | null;
  closesAt: string;
  /** Drafts only. */
  anonymous: boolean;
  /** Drafts only. */
  questions: PollQuestionInput[];
}

export interface PollOptionResult {
  optionId: string;
  text: string;
  count: number;
  percentage: number;
  /** Who chose it; null for anonymous polls. */
  voters: Array<{ voterId: string; name: string | null }> | null;
}

export interface PollQuestionResult {
  questionId: string;
  text: string;
  type: PollQuestionType;
  answeredCount: number;
  options: PollOptionResult[];
}

export interface PollResults {
  pollId: string;
  status: PollStatus;
  anonymous: boolean;
  closedAt: string | null;
  totalVoters: number;
  questions: PollQuestionResult[];
}

export interface PollActivity {
  _id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  userName: string | null;
  at: string | null;
  details: Record<string, unknown>;
}

export class PollsError extends Error {
  constructor(
    message: string,
    readonly code: string | null = null
  ) {
    super(message);
    this.name = 'PollsError';
  }
}

/**
 * Every action rejects with a `PollsError` whose message is shown to the
 * user.
 */
export interface PollsDataProvider {
  getInfo(): Promise<PollsInfo>;
  loadPolls(query: PollsQuery): Promise<PollPage>;
  loadPoll(pollId: string): Promise<Poll>;
  loadResults(pollId: string): Promise<PollResults>;
  /** Managers only. Newest first; `before` is the last entry's `at`. */
  loadActivity(pollId: string, before?: string): Promise<PollActivity[]>;

  createPoll(details: PollDetails): Promise<Poll>;
  updatePoll(pollId: string, details: PollDetails): Promise<Poll>;
  openPoll(pollId: string, closesAt?: string): Promise<Poll>;
  closePoll(pollId: string): Promise<Poll>;
  reopenPoll(pollId: string, closesAt: string): Promise<Poll>;
  cancelPoll(pollId: string, reason?: string): Promise<Poll>;
  deletePoll(pollId: string): Promise<void>;

  vote(pollId: string, answers: PollAnswer[]): Promise<Poll>;
  withdrawVote(pollId: string): Promise<Poll>;
}
