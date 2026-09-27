import { useQuery } from '@apollo/client/react';

import { MOBILE_CURRENT_USER } from '../gql';
import { useAuthState } from './use-auth-state';

export const useCurrentUser = () => {
  const { userId } = useAuthState();
  // Logout clears the Apollo store, so the next sign-in always fetches afresh.
  const { data, loading, error, refetch } = useQuery(MOBILE_CURRENT_USER, {
    skip: !userId,
  });

  return {
    user: data?.currentUser ?? null,
    userLoading: loading,
    userError: error,
    refetchUser: () => {
      refetch().catch(() => undefined);
    },
  };
};
