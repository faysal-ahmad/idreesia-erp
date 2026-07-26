import type { WatchQueryFetchPolicy } from '@apollo/client';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

interface DistinctStayAllowedByData {
  distinctStayAllowedBy: string[];
}

const QUERY = gql`
  query distinctStayAllowedBy {
    distinctStayAllowedBy
  }
`;

const useDistinctStayAllowedBy = (
  fetchPolicy: WatchQueryFetchPolicy = 'no-cache'
) => {
  const { data, loading, refetch } = useQuery<DistinctStayAllowedByData>(QUERY, {
    fetchPolicy,
  });

  return {
    distinctStayAllowedBy: data ? data.distinctStayAllowedBy : null,
    distinctStayAllowedByLoading: loading,
    distinctStayAllowedByRefetch: refetch,
  };
};

export default useDistinctStayAllowedBy;
