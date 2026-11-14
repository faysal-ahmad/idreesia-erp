import {
  createPoll,
  setPollQuestions,
  updatePoll,
  type PollQuestionInput,
  type UpdatePollInput,
} from 'meteor/idreesia-common/server/business-logic/polls';
import { PollStatus } from 'meteor/idreesia-common/constants/polls';
import type { PollDocument } from 'meteor/idreesia-common/server/collections/polls';

import { parseTimestamp } from './meetings-actions';

/*
 * Committee-side poll changes that take more than one polls-module call, or
 * translate the Workspaces API's inputs (timestamps as strings of
 * milliseconds). Callers check access first.
 */

export interface CommitteePollInput {
  title: string;
  description?: string | null;
  closesAt: string;
  anonymous?: boolean | null;
  questions?: PollQuestionInput[] | null;
}

export async function createCommitteePoll(
  workspaceId: string,
  input: CommitteePollInput,
  userId: string
) {
  return createPoll(
    {
      workspaceId,
      title: input.title,
      description: input.description ?? undefined,
      closesAt: parseTimestamp(input.closesAt)!,
      anonymous: input.anonymous ?? false,
      questions: input.questions ?? [],
    },
    userId
  );
}

/**
 * Saves the edit form. Drafts take every field; an open poll only takes
 * what can still change (title, description, end time, results setting).
 * The end time is only sent when it changed.
 */
export async function updateCommitteePoll(
  poll: PollDocument,
  input: CommitteePollInput,
  userId: string
) {
  const isDraft = poll.status === PollStatus.DRAFT;
  const closesAt = parseTimestamp(input.closesAt);
  const changes: UpdatePollInput = {
    title: input.title,
    description: input.description ?? null,
    ...(closesAt && closesAt.getTime() !== poll.closesAt.getTime()
      ? { closesAt }
      : {}),
    ...(isDraft
      ? {
          anonymous: input.anonymous ?? poll.anonymous,
            }
      : {}),
  };
  const updated = await updatePoll(poll._id, changes, userId);
  if (isDraft && input.questions) {
    return setPollQuestions(poll._id, input.questions, userId);
  }
  return updated;
}
