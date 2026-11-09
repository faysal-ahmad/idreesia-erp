import { useMemo } from 'react';
import { useApolloClient } from '@apollo/client/react';

import CommitteeProjectsProvider from './committee-projects-provider';

/** One provider per committee, kept across renders. */
export const useCommitteeProjectsProvider = (committeeId: string) => {
  const client = useApolloClient();
  return useMemo(
    () => new CommitteeProjectsProvider(client, committeeId),
    [client, committeeId]
  );
};
