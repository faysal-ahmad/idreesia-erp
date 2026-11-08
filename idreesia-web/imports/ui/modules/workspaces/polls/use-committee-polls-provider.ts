import { useMemo } from 'react';
import { useApolloClient } from '@apollo/client/react';

import CommitteePollsProvider from './committee-polls-provider';

/** One provider per committee, kept across renders. */
export const useCommitteePollsProvider = (committeeId: string) => {
  const client = useApolloClient();
  return useMemo(
    () => new CommitteePollsProvider(client, committeeId),
    [client, committeeId]
  );
};
