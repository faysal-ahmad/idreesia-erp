import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query distinctTeamNames {
    distinctTeamNames
  }
`;

const useDistinctTeamNames = () => {
  const { data, loading } = useQuery(QUERY, {
    fetchPolicy: 'no-cache',
  });

  return {
    distinctTeamNames: data ? data.distinctTeamNames : null,
    distinctTeamNamesLoading: loading,
  };
};

export default useDistinctTeamNames;
