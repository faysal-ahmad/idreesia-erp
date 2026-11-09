import { useQuery } from '@apollo/client/react';
import type { MobileWorkspacePollFieldsFragment } from 'meteor/idreesia-common/types/client-operations';

import {
  MOBILE_WORKSPACE_POLL_BY_ID,
  MOBILE_WORKSPACE_POLLS_INFO,
} from './gql';

export type Poll = MobileWorkspacePollFieldsFragment;
export type Question = NonNullable<NonNullable<Poll['questions']>[number]>;
type Option = NonNullable<NonNullable<Question['options']>[number]>;

/** Whether the user manages this committee's polls. */
export const usePollsInfo = (committeeId: string) => {
  const info = useQuery(MOBILE_WORKSPACE_POLLS_INFO, {
    variables: { committeeId },
    fetchPolicy: 'cache-and-network',
  });
  return {
    canManage: !!info.data?.workspacePollsInfo?.canManage,
  };
};

/** The poll's questions, with ids and options only. */
export const pollQuestions = (poll?: Poll | null) =>
  (poll?.questions ?? [])
    .filter((question): question is Question & { _id: string } => !!question?._id)
    .map(question => ({
      ...question,
      options: (question.options ?? []).filter(
        (option): option is Option & { _id: string } => !!option?._id,
      ),
    }));

/**
 * One poll. Every poll screen reads it from here; the mutations return the
 * updated poll, so Apollo's cache keeps the screens in step.
 */
export const usePoll = (
  committeeId: string,
  pollId: string,
  { skip = false }: { skip?: boolean } = {},
) => {
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_POLL_BY_ID, {
    variables: { committeeId, pollId },
    fetchPolicy: 'cache-and-network',
    skip,
  });
  const poll = data?.workspacePollById ?? null;
  return {
    poll,
    questions: pollQuestions(poll),
    loading: loading && !poll,
    error: poll ? undefined : error,
    refetch: () => refetch().then(
      () => undefined,
      () => undefined,
    ),
  };
};
