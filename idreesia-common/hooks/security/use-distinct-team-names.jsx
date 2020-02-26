import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query distinctTeamNames {
    distinctTeamNames
  }
`;

const useDistinctTeamNames = (fetchPolicy = 'no-cache') => {
  const { data, loading, refetch } = useQuery(QUERY, {
    fetchPolicy,
  });

  return {
    distinctTeamNames: data ? data.distinctTeamNames : null,
    distinctTeamNamesLoading: loading,
    distinctTeamNamesRefetch: refetch,
  };
};

export default useDistinctTeamNames;
