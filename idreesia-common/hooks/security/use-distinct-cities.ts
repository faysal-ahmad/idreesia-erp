import type { WatchQueryFetchPolicy } from '@apollo/client';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

interface DistinctCitiesData {
  distinctCities: string[];
}

const QUERY = gql`
  query distinctCities {
    distinctCities
  }
`;

const useDistinctCities = (fetchPolicy: WatchQueryFetchPolicy = 'no-cache') => {
  const { data, loading, refetch } = useQuery<DistinctCitiesData>(QUERY, {
    fetchPolicy,
  });

  return {
    distinctCities: data ? data.distinctCities : null,
    distinctCitiesLoading: loading,
    distinctCitiesRefetch: refetch,
  };
};

export default useDistinctCities;
