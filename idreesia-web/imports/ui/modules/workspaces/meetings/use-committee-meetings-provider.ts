import { useMemo } from 'react';
import { useApolloClient } from '@apollo/client/react';

import CommitteeMeetingsProvider from './committee-meetings-provider';

/** One provider per committee, kept across renders. */
export const useCommitteeMeetingsProvider = (committeeId: string) => {
  const client = useApolloClient();
  return useMemo(
    () => new CommitteeMeetingsProvider(client, committeeId),
    [client, committeeId]
  );
};
