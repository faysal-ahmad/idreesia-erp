import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query distinctCities {
    distinctCities
  }
`;

const useDistinctCities = (fetchPolicy = 'no-cache') => {
  const { data, loading, refetch } = useQuery(QUERY, {
    fetchPolicy,
  });

  return {
    distinctCities: data ? data.distinctCities : null,
    distinctCitiesLoading: loading,
    distinctCitiesRefetch: refetch,
  };
};

export default useDistinctCities;
