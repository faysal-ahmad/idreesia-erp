import { useEffect } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useSelector } from 'react-redux';
import type {
  CommonCurrentUserQuery,
  CommonCurrentUserQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

interface LoggedInUserState {
  loggedInUserId?: string | null;
}

const formQuery: TypedDocumentNode<
  CommonCurrentUserQuery,
  CommonCurrentUserQueryVariables
> = gql`
  query commonCurrentUser {
    currentUser {
      _id
      username
      displayName
      permissions
      instances
      karkun {
        _id
        name
        imageId
      }
    }
  }
`;

const useLoggedInUser = () => {
  const loggedInUserId = useSelector(
    (state: LoggedInUserState) => state.loggedInUserId
  );
  const { data, loading, refetch } = useQuery(formQuery);
  useEffect(() => {
    refetch();
  }, [loggedInUserId]);

  return {
    user: data?.currentUser ?? null,
    userLoading: loading,
  };
};

export default useLoggedInUser;
