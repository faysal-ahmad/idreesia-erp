import { Random } from 'meteor/random';

import {
  POLLS_MAX_OPTIONS,
  POLLS_MAX_QUESTION_LENGTH,
  POLLS_MAX_QUESTIONS,
  POLLS_MIN_OPTIONS,
  PollsAction,
  PollsEntityType,
  PollQuestionType,
  type PollQuestionTypeValue,
} from 'meteor/idreesia-common/constants/polls';
import type {
  PollDocument,
  PollOption,
  PollQuestion,
} from 'meteor/idreesia-common/server/collections/polls';

import { logActivity } from './activity';
import { pollsError } from './errors';
import {
  DRAFT_ONLY,
  normalizeText,
  normalizeTitle,
  requireOneOf,
  requirePoll,
  requireUserId,
  writePoll,
} from './internal';

export interface PollOptionInput {
  /** Keeps an existing option's id; ignored for new options. */
  _id?: string | null;
  text: string;
}

export interface PollQuestionInput {
  /** Keeps an existing question's id; ignored for new questions. */
  _id?: string | null;
  text: string;
  description?: string | null;
  /** Default `single`. */
  type?: PollQuestionTypeValue;
  /** Default true. */
  required?: boolean;
  /** Multiple-choice only. Default 1. */
  minChoices?: number | null;
  /** Multiple-choice only. Default: every option. */
  maxChoices?: number | null;
  options: PollOptionInput[];
}

const isCount = (value: unknown) =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 1;

/**
 * Validates questions and gives them ids. Ids passed in are kept when they
 * belong to a question (or option) of `existing`, so answers and links
 * stay stable when a draft's questions are edited.
 */
export function buildQuestions(
  input: unknown,
  existing: PollQuestion[] = []
): PollQuestion[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) {
    throw pollsError('BAD_USER_INPUT', 'Questions must be a list');
  }
  if (input.length > POLLS_MAX_QUESTIONS) {
    throw pollsError(
      'BAD_USER_INPUT',
      `A poll can have at most ${POLLS_MAX_QUESTIONS} questions`
    );
  }

  const existingQuestions = new Map(existing.map(q => [q._id, q]));
  const usedQuestionIds = new Set<string>();

  return (input as PollQuestionInput[]).map((question, index) => {
    const what = `Question ${index + 1}`;
    if (!question || typeof question !== 'object') {
      throw pollsError('BAD_USER_INPUT', `${what} is invalid`);
    }
    const text = normalizeTitle(question.text, what, POLLS_MAX_QUESTION_LENGTH);
    const description = normalizeText(question.description, `${what} description`);
    const type = requireOneOf(
      question.type ?? PollQuestionType.SINGLE,
      PollQuestionType,
      `${what} type`
    );
    const required = question.required ?? true;
    if (typeof required !== 'boolean') {
      throw pollsError('BAD_USER_INPUT', `${what}: required must be true or false`);
    }

    const previous =
      question._id && !usedQuestionIds.has(question._id)
        ? existingQuestions.get(question._id)
        : undefined;
    const questionId = previous?._id ?? Random.id();
    usedQuestionIds.add(questionId);

    const options = buildOptions(question.options, what, previous?.options);

    let minChoices: number | undefined;
    let maxChoices: number | undefined;
    if (type === PollQuestionType.MULTIPLE) {
      if (question.minChoices != null) {
        if (!isCount(question.minChoices)) {
          throw pollsError('BAD_USER_INPUT', `${what}: minChoices must be at least 1`);
        }
        minChoices = question.minChoices;
      }
      if (question.maxChoices != null) {
        if (!isCount(question.maxChoices)) {
          throw pollsError('BAD_USER_INPUT', `${what}: maxChoices must be at least 1`);
        }
        maxChoices = question.maxChoices;
      }
      const effectiveMax = maxChoices ?? options.length;
      if (options.length && effectiveMax > options.length) {
        throw pollsError(
          'BAD_USER_INPUT',
          `${what}: maxChoices can't be more than the number of options`
        );
      }
      if ((minChoices ?? 1) > effectiveMax) {
        throw pollsError(
          'BAD_USER_INPUT',
          `${what}: minChoices can't be more than maxChoices`
        );
      }
    }

    return {
      _id: questionId,
      text,
      ...(description ? { description } : {}),
      type,
      required,
      ...(minChoices !== undefined ? { minChoices } : {}),
      ...(maxChoices !== undefined ? { maxChoices } : {}),
      options,
    };
  });
}

function buildOptions(
  input: unknown,
  what: string,
  existing: PollOption[] = []
): PollOption[] {
  if (!Array.isArray(input)) {
    throw pollsError('BAD_USER_INPUT', `${what}: options must be a list`);
  }
  if (input.length > POLLS_MAX_OPTIONS) {
    throw pollsError(
      'BAD_USER_INPUT',
      `${what} can have at most ${POLLS_MAX_OPTIONS} options`
    );
  }
  const existingIds = new Set(existing.map(({ _id }) => _id));
  const usedIds = new Set<string>();
  const texts = new Set<string>();

  return (input as PollOptionInput[]).map((option, index) => {
    const text = normalizeTitle(option?.text, `${what}, option ${index + 1}`);
    const key = text.toLowerCase();
    if (texts.has(key)) {
      throw pollsError('BAD_USER_INPUT', `${what} has the option "${text}" twice`);
    }
    texts.add(key);
    const id =
      option?._id && existingIds.has(option._id) && !usedIds.has(option._id)
        ? option._id
        : Random.id();
    usedIds.add(id);
    return { _id: id, text };
  });
}

/** Checks that a poll's questions are complete enough to vote on. */
export function assertQuestionsReady(questions: PollQuestion[]) {
  if (!questions.length) {
    throw pollsError('CONFLICT', 'A poll needs at least one question');
  }
  const short = questions.find(q => q.options.length < POLLS_MIN_OPTIONS);
  if (short) {
    throw pollsError(
      'CONFLICT',
      `"${short.text}" needs at least ${POLLS_MIN_OPTIONS} options`,
      { questionId: short._id }
    );
  }
}

/** Replaces a draft poll's questions. */
export async function setPollQuestions(
  pollId: string,
  questions: PollQuestionInput[],
  userId: string
): Promise<PollDocument> {
  requireUserId(userId);
  const poll = await requirePoll(pollId);
  const built = buildQuestions(questions, poll.questions);
  const updated = await writePoll(
    poll,
    userId,
    { $set: { questions: built } },
    { allowed: DRAFT_ONLY }
  );
  await logActivity({
    workspaceId: poll.workspaceId,
    pollId,
    entityType: PollsEntityType.POLL,
    entityId: pollId,
    action: PollsAction.QUESTIONS_UPDATED,
    userId,
    details: { questionCount: built.length },
  });
  return updated;
}
