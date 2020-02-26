import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query distinctStayAllowedBy {
    distinctStayAllowedBy
  }
`;

const useDistinctStayAllowedBy = (fetchPolicy = 'no-cache') => {
  const { data, loading, refetch } = useQuery(QUERY, {
    fetchPolicy,
  });

  return {
    distinctStayAllowedBy: data ? data.distinctStayAllowedBy : null,
    distinctStayAllowedByLoading: loading,
    distinctStayAllowedByRefetch: refetch,
  };
};

export default useDistinctStayAllowedBy;
