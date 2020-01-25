import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useSelector } from 'react-redux';

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
  const loggedInUserId = useSelector(state => state.loggedInUserId);
  const { data, loading, refetch } = useQuery(formQuery);
  useEffect(() => {
    refetch();
  }, [loggedInUserId]);

  return {
    user: data ? data.currentUser : null,
    userLoading: loading,
  };
};

export default useLoggedInUser;
