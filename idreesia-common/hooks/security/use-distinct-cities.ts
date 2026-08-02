import type { TypedDocumentNode, WatchQueryFetchPolicy } from '@apollo/client';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import type {
  SecurityDistinctCitiesQuery,
  SecurityDistinctCitiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const QUERY: TypedDocumentNode<
  SecurityDistinctCitiesQuery,
  SecurityDistinctCitiesQueryVariables
> = gql`
  query securityDistinctCities {
    distinctCities
  }
`;

const normalizeStrings = (
  values: SecurityDistinctCitiesQuery['distinctCities']
): string[] | null => {
  if (!values) return null;
  return values.filter((value): value is string => value != null);
};

const useDistinctCities = (fetchPolicy: WatchQueryFetchPolicy = 'no-cache') => {
  const { data, loading, refetch } = useQuery(QUERY, {
    fetchPolicy,
  });

  return {
    distinctCities: normalizeStrings(data?.distinctCities ?? null),
    distinctCitiesLoading: loading,
    distinctCitiesRefetch: refetch,
  };
};

export default useDistinctCities;
