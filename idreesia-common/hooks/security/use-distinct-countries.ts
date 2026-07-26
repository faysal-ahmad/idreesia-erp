import type { WatchQueryFetchPolicy } from '@apollo/client';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

interface DistinctCountriesData {
  distinctCountries: string[];
}

const QUERY = gql`
  query distinctCountries {
    distinctCountries
  }
`;

const useDistinctCountries = (
  fetchPolicy: WatchQueryFetchPolicy = 'no-cache'
) => {
  const { data, loading, refetch } = useQuery<DistinctCountriesData>(QUERY, {
    fetchPolicy,
  });

  return {
    distinctCountries: data ? data.distinctCountries : null,
    distinctCountriesLoading: loading,
    distinctCountriesRefetch: refetch,
  };
};

export default useDistinctCountries;
