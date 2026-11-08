import type {
  PollQuestionTypeValue,
  PollsActionValue,
  PollsEntityTypeValue,
  PollStatusValue,
} from 'meteor/idreesia-common/constants/polls';

/** Free-form key/value data callers attach to workspaces and polls. */
export type PollsMetadata = Record<string, unknown>;

interface Timestamps {
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface PollsWorkspaceDocument extends Timestamps {
  _id: string;
  name: string;
  description?: string;
  metadata?: PollsMetadata;
}

export interface PollOption {
  _id: string;
  text: string;
}

export interface PollQuestion {
  _id: string;
  text: string;
  description?: string;
  type: PollQuestionTypeValue;
  required: boolean;
  /** Multiple-choice only: fewest options in an answer. Default 1. */
  minChoices?: number;
  /** Multiple-choice only. Default: every option. */
  maxChoices?: number;
  options: PollOption[];
}

export interface PollDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  title: string;
  description?: string;
  tags: string[];
  metadata?: PollsMetadata;
  anonymous: boolean;
  showResultsWhileOpen: boolean;
  /** Opaque ids chosen by the caller. Unset: no restriction. */
  eligibleVoterIds?: string[];
  questions: PollQuestion[];
  closesAt: Date;
  status: PollStatusValue;
  openedAt?: Date;
  openedBy?: string;
  closedAt?: Date;
  /** Unset when the poll closed on its own at closesAt. */
  closedBy?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  voteCount: number;
  revision: number;
}

export interface PollAnswer {
  questionId: string;
  optionIds: string[];
}

export interface PollBallotDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  pollId: string;
  voterId: string;
  answers: PollAnswer[];
}

export interface PollsActivityDocument {
  _id: string;
  workspaceId: string;
  pollId?: string;
  entityType: PollsEntityTypeValue;
  entityId: string;
  action: PollsActionValue;
  userId: string;
  at: Date;
  details?: Record<string, unknown>;
}
