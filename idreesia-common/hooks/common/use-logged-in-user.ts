import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import { useSelector } from 'react-redux';

interface LoggedInUserState {
  loggedInUserId?: string | null;
}

interface CurrentUserData {
  currentUser: {
    _id: string;
    username?: string | null;
    displayName?: string | null;
    permissions?: string[] | null;
    instances?: string[] | null;
    karkun?: {
      _id: string;
      name?: string | null;
      imageId?: string | null;
    } | null;
  } | null;
}

const formQuery = gql`
  query currentUser {
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
  const { data, loading, refetch } = useQuery<CurrentUserData>(formQuery);
  useEffect(() => {
    refetch();
  }, [loggedInUserId]);

  return {
    user: data ? data.currentUser : null,
    userLoading: loading,
  };
};

export default useLoggedInUser;
