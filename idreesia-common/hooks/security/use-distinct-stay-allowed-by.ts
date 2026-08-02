import type { TypedDocumentNode, WatchQueryFetchPolicy } from '@apollo/client';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import type {
  SecurityDistinctStayAllowedByQuery,
  SecurityDistinctStayAllowedByQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const QUERY: TypedDocumentNode<
  SecurityDistinctStayAllowedByQuery,
  SecurityDistinctStayAllowedByQueryVariables
> = gql`
  query securityDistinctStayAllowedBy {
    distinctStayAllowedBy
  }
`;

const normalizeStrings = (
  values: SecurityDistinctStayAllowedByQuery['distinctStayAllowedBy']
): string[] | null => {
  if (!values) return null;
  return values.filter((value): value is string => value != null);
};

const useDistinctStayAllowedBy = (
  fetchPolicy: WatchQueryFetchPolicy = 'no-cache'
) => {
  const { data, loading, refetch } = useQuery(QUERY, {
    fetchPolicy,
  });

  return {
    distinctStayAllowedBy: normalizeStrings(data?.distinctStayAllowedBy ?? null),
    distinctStayAllowedByLoading: loading,
    distinctStayAllowedByRefetch: refetch,
  };
};

export default useDistinctStayAllowedBy;
