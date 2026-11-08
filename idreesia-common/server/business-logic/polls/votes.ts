import {
  PollsAction,
  PollsEntityType,
  PollQuestionType,
  PollStatus,
} from 'meteor/idreesia-common/constants/polls';
import {
  PollBallots,
  Polls,
  type PollAnswer,
  type PollBallotDocument,
  type PollDocument,
} from 'meteor/idreesia-common/server/collections/polls';

import { logActivity } from './activity';
import { pollsError } from './errors';
import {
  assertStatus,
  normalizeOpaqueId,
  normalizePage,
  OPEN_ONLY,
  requirePoll,
  requireUserId,
  type PollsPage,
  type PollsPageOptions,
} from './internal';

export interface PollAnswerInput {
  questionId: string;
  /** Empty or missing leaves an optional question unanswered. */
  optionIds?: string[] | null;
}

/** The poll accepts votes now: it is open and its end time hasn't passed. */
function assertAcceptingVotes(poll: PollDocument) {
  assertStatus(poll, OPEN_ONLY);
  if (poll.closesAt.getTime() <= Date.now()) {
    throw pollsError('CONFLICT', 'Voting on this poll has ended', {
      status: PollStatus.CLOSED,
    });
  }
}

function assertEligible(poll: PollDocument, voterId: string) {
  if (poll.eligibleVoterIds?.length && !poll.eligibleVoterIds.includes(voterId)) {
    throw pollsError('FORBIDDEN', 'This voter is not eligible to vote in this poll');
  }
}

/**
 * Checks answers against the poll's questions: every required question is
 * answered, options belong to their question, and the number of choices
 * suits the question. Returns them in question order.
 */
export function validateAnswers(
  poll: PollDocument,
  input: unknown
): PollAnswer[] {
  if (!Array.isArray(input)) {
    throw pollsError('BAD_USER_INPUT', 'Answers must be a list');
  }
  const byQuestion = new Map<string, string[]>();
  (input as PollAnswerInput[]).forEach(answer => {
    const questionId = answer?.questionId;
    if (typeof questionId !== 'string' || !questionId) {
      throw pollsError('BAD_USER_INPUT', 'Each answer needs a question id');
    }
    if (byQuestion.has(questionId)) {
      throw pollsError('BAD_USER_INPUT', 'A question is answered twice', {
        questionId,
      });
    }
    const optionIds = answer.optionIds ?? [];
    if (!Array.isArray(optionIds) || optionIds.some(id => typeof id !== 'string')) {
      throw pollsError('BAD_USER_INPUT', 'Option ids must be a list of ids');
    }
    byQuestion.set(questionId, optionIds);
  });

  const known = new Set(poll.questions.map(({ _id }) => _id));
  const unknown = [...byQuestion.keys()].find(id => !known.has(id));
  if (unknown) {
    throw pollsError('BAD_USER_INPUT', 'An answer is for an unknown question', {
      questionId: unknown,
    });
  }

  const answers: PollAnswer[] = [];
  poll.questions.forEach(question => {
    const chosen = byQuestion.get(question._id) ?? [];
    const details = { questionId: question._id };
    if (!chosen.length) {
      if (question.required) {
        throw pollsError('BAD_USER_INPUT', `"${question.text}" must be answered`, details);
      }
      return;
    }
    if (new Set(chosen).size !== chosen.length) {
      throw pollsError('BAD_USER_INPUT', `"${question.text}" has an option chosen twice`, details);
    }
    const optionIds = new Set(question.options.map(({ _id }) => _id));
    if (chosen.some(id => !optionIds.has(id))) {
      throw pollsError('BAD_USER_INPUT', `"${question.text}" has an unknown option`, details);
    }
    if (question.type === PollQuestionType.SINGLE) {
      if (chosen.length !== 1) {
        throw pollsError('BAD_USER_INPUT', `Choose one option for "${question.text}"`, details);
      }
    } else {
      const min = question.minChoices ?? 1;
      const max = question.maxChoices ?? question.options.length;
      if (chosen.length < min || chosen.length > max) {
        throw pollsError(
          'BAD_USER_INPUT',
          min === max
            ? `Choose ${min} options for "${question.text}"`
            : `Choose ${min} to ${max} options for "${question.text}"`,
          details
        );
      }
    }
    answers.push({ questionId: question._id, optionIds: chosen });
  });
  if (!answers.length) {
    throw pollsError('BAD_USER_INPUT', 'Answer at least one question');
  }
  return answers;
}

const isDuplicateKeyError = (error: unknown) =>
  (error as { code?: number })?.code === 11000 ||
  /E11000/.test(String((error as Error)?.message ?? ''));

const logVote = async (
  poll: PollDocument,
  action: (typeof PollsAction)[keyof typeof PollsAction],
  userId: string
) => {
  // The entry says that someone voted, never what they chose. Anonymous
  // polls log no votes at all, so the log can't tell who took part.
  if (poll.anonymous) return;
  await logActivity({
    workspaceId: poll.workspaceId,
    pollId: poll._id,
    entityType: PollsEntityType.VOTE,
    entityId: poll._id,
    action,
    userId,
  });
};

/**
 * Records a voter's answers, replacing their earlier vote, while the poll
 * is open. Returns the ballot and whether it was a new vote.
 */
export async function castVote(
  pollId: string,
  voterId: string,
  answers: PollAnswerInput[],
  userId: string
): Promise<{ ballot: PollBallotDocument; isNew: boolean }> {
  requireUserId(userId);
  const id = normalizeOpaqueId(voterId, 'Voter id');
  const poll = await requirePoll(pollId);
  assertAcceptingVotes(poll);
  assertEligible(poll, id);
  const validated = validateAnswers(poll, answers);

  const now = new Date();
  const update = async () => {
    await PollBallots.updateAsync(
      { pollId, voterId: id },
      { $set: { answers: validated, updatedAt: now, updatedBy: userId } }
    );
    await logVote(poll, PollsAction.VOTE_CHANGED, userId);
    return { ballot: (await getBallot(pollId, id))!, isNew: false };
  };

  if (await getBallot(pollId, id)) return update();
  try {
    await PollBallots.insertAsync({
      workspaceId: poll.workspaceId,
      pollId,
      voterId: id,
      answers: validated,
      createdAt: now,
      createdBy: userId,
      updatedAt: now,
      updatedBy: userId,
    });
  } catch (error) {
    // A concurrent request recorded this voter's first vote.
    if (isDuplicateKeyError(error)) return update();
    throw error;
  }
  await Polls.updateAsync(pollId, { $inc: { voteCount: 1 } });
  await logVote(poll, PollsAction.VOTE_CAST, userId);
  return { ballot: (await getBallot(pollId, id))!, isNew: true };
}

/** Removes a voter's vote while the poll is open. */
export async function withdrawVote(
  pollId: string,
  voterId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const id = normalizeOpaqueId(voterId, 'Voter id');
  const poll = await requirePoll(pollId);
  assertAcceptingVotes(poll);
  const removed = await PollBallots.removeAsync({ pollId, voterId: id });
  if (!removed) throw pollsError('NOT_FOUND', 'No vote to withdraw');
  await Polls.updateAsync(pollId, { $inc: { voteCount: -1 } });
  await logVote(poll, PollsAction.VOTE_WITHDRAWN, userId);
}

const getBallot = (pollId: string, voterId: string) =>
  PollBallots.findOneAsync({ pollId, voterId });

/**
 * A voter's own ballot, or null if they haven't voted. Works for anonymous
 * polls too: the caller makes sure it is only shown to the voter.
 */
export async function getVote(
  pollId: string,
  voterId: string,
  userId: string
): Promise<PollBallotDocument | null> {
  requireUserId(userId);
  const id = normalizeOpaqueId(voterId, 'Voter id');
  await requirePoll(pollId);
  return (await getBallot(pollId, id)) ?? null;
}

/** Every ballot of a named poll, oldest first. Refused for anonymous polls. */
export async function listBallots(
  pollId: string,
  userId: string,
  page: PollsPageOptions = {}
): Promise<PollsPage<PollBallotDocument>> {
  requireUserId(userId);
  const poll = await requirePoll(pollId);
  if (poll.anonymous) {
    throw pollsError('FORBIDDEN', "An anonymous poll's ballots can't be listed");
  }
  const { skip, limit } = normalizePage(page);
  const [data, totalResults] = await Promise.all([
    PollBallots.find({ pollId }, { sort: { createdAt: 1, _id: 1 }, skip, limit }).fetchAsync(),
    PollBallots.find({ pollId }).countAsync(),
  ]);
  return { data, totalResults };
}

