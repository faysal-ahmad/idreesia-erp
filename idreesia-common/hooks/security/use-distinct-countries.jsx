import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query distinctCountries {
    distinctCountries
  }
`;

const useDistinctCountries = (fetchPolicy = 'no-cache') => {
  const { data, loading, refetch } = useQuery(QUERY, {
    fetchPolicy,
  });

  return {
    distinctCountries: data ? data.distinctCountries : null,
    distinctCountriesLoading: loading,
    distinctCountriesRefetch: refetch,
  };
};

export default useDistinctCountries;
