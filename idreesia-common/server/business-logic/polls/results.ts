import {
  PollStatus,
  type PollQuestionTypeValue,
  type PollStatusValue,
} from 'meteor/idreesia-common/constants/polls';
import {
  PollBallots,
  type PollDocument,
} from 'meteor/idreesia-common/server/collections/polls';

import { pollsError } from './errors';
import { requirePoll, requireUserId } from './internal';

export interface PollOptionResult {
  optionId: string;
  text: string;
  count: number;
  /** Of the voters who answered the question, 0-100, one decimal. */
  percentage: number;
  /** Who chose it. Named polls only. */
  voterIds?: string[];
}

export interface PollQuestionResult {
  questionId: string;
  text: string;
  type: PollQuestionTypeValue;
  /** Voters who answered this question. */
  answeredCount: number;
  options: PollOptionResult[];
}

export interface PollResults {
  pollId: string;
  status: PollStatusValue;
  anonymous: boolean;
  closedAt?: Date;
  /** Number of ballots. */
  totalVoters: number;
  /** Size of the eligible list, when the poll has one. */
  eligibleCount?: number;
  /** totalVoters / eligibleCount, 0-100, one decimal. */
  turnout?: number;
  /** Eligible voters who didn't vote. Named polls with a list only. */
  nonVoterIds?: string[];
  questions: PollQuestionResult[];
}

const percent = (part: number, whole: number) =>
  whole ? Math.round((part / whole) * 1000) / 10 : 0;

/** Whether a poll's results can be read now. */
export const canSeeResults = (poll: PollDocument) =>
  poll.status === PollStatus.CLOSED ||
  (poll.status === PollStatus.OPEN && poll.showResultsWhileOpen);

interface OptionTally {
  _id: { questionId: string; optionId: string };
  count: number;
  voterIds?: string[];
}

interface QuestionTally {
  _id: string;
  answeredCount: number;
}

/**
 * Vote counts per option, once the poll is closed (or while it is open, if
 * the poll shows results while open). Named polls also list who chose each
 * option and who didn't vote; anonymous polls never name voters.
 */
export async function getPollResults(
  pollId: string,
  userId: string
): Promise<PollResults> {
  requireUserId(userId);
  const poll = await requirePoll(pollId);
  if (!canSeeResults(poll)) {
    throw pollsError(
      'CONFLICT',
      poll.status === PollStatus.OPEN
        ? 'Results are available once the poll closes'
        : `A ${poll.status} poll has no results`,
      { status: poll.status }
    );
  }

  const raw = PollBallots.rawCollection();
  const [optionTallies, questionTallies, ballotVoters] = await Promise.all([
    raw
      .aggregate<OptionTally>([
        { $match: { pollId } },
        { $unwind: '$answers' },
        { $unwind: '$answers.optionIds' },
        {
          $group: {
            _id: {
              questionId: '$answers.questionId',
              optionId: '$answers.optionIds',
            },
            count: { $sum: 1 },
            // Anonymous polls never collect who chose what.
            ...(poll.anonymous ? {} : { voterIds: { $push: '$voterId' } }),
          },
        },
      ])
      .toArray(),
    raw
      .aggregate<QuestionTally>([
        { $match: { pollId } },
        { $unwind: '$answers' },
        { $group: { _id: '$answers.questionId', answeredCount: { $sum: 1 } } },
      ])
      .toArray(),
    PollBallots.find({ pollId }, { fields: { voterId: 1 } }).fetchAsync(),
  ]);

  const tallyKey = (questionId: string, optionId: string) =>
    `${questionId}:${optionId}`;
  const optionMap = new Map(
    optionTallies.map(tally => [
      tallyKey(tally._id.questionId, tally._id.optionId),
      tally,
    ])
  );
  const answeredMap = new Map(
    questionTallies.map(({ _id, answeredCount }) => [_id, answeredCount])
  );

  const questions = poll.questions.map(question => {
    const answeredCount = answeredMap.get(question._id) ?? 0;
    return {
      questionId: question._id,
      text: question.text,
      type: question.type,
      answeredCount,
      options: question.options.map(option => {
        const tally = optionMap.get(tallyKey(question._id, option._id));
        const count = tally?.count ?? 0;
        return {
          optionId: option._id,
          text: option.text,
          count,
          percentage: percent(count, answeredCount),
          ...(poll.anonymous ? {} : { voterIds: tally?.voterIds ?? [] }),
        };
      }),
    };
  });

  const totalVoters = ballotVoters.length;
  const eligible = poll.eligibleVoterIds?.length ? poll.eligibleVoterIds : undefined;
  const voted = new Set(ballotVoters.map(({ voterId }) => voterId));

  return {
    pollId: poll._id,
    status: poll.status,
    anonymous: poll.anonymous,
    ...(poll.closedAt ? { closedAt: poll.closedAt } : {}),
    totalVoters,
    ...(eligible
      ? {
          eligibleCount: eligible.length,
          turnout: percent(totalVoters, eligible.length),
          ...(poll.anonymous
            ? {}
            : { nonVoterIds: eligible.filter(id => !voted.has(id)) }),
        }
      : {}),
    questions,
  };
}
