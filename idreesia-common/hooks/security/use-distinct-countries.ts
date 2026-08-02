import type { TypedDocumentNode, WatchQueryFetchPolicy } from '@apollo/client';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import type {
  SecurityDistinctCountriesQuery,
  SecurityDistinctCountriesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const QUERY: TypedDocumentNode<
  SecurityDistinctCountriesQuery,
  SecurityDistinctCountriesQueryVariables
> = gql`
  query securityDistinctCountries {
    distinctCountries
  }
`;

const normalizeStrings = (
  values: SecurityDistinctCountriesQuery['distinctCountries']
): string[] | null => {
  if (!values) return null;
  return values.filter((value): value is string => value != null);
};

const useDistinctCountries = (
  fetchPolicy: WatchQueryFetchPolicy = 'no-cache'
) => {
  const { data, loading, refetch } = useQuery(QUERY, {
    fetchPolicy,
  });

  return {
    distinctCountries: normalizeStrings(data?.distinctCountries ?? null),
    distinctCountriesLoading: loading,
    distinctCountriesRefetch: refetch,
  };
};

export default useDistinctCountries;
