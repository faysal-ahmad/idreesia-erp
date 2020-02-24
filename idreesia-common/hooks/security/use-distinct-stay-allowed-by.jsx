import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query distinctStayAllowedBy {
    distinctStayAllowedBy
  }
`;

const useDistinctStayAllowedBy = () => {
  const { data, loading } = useQuery(QUERY, {
    fetchPolicy: 'no-cache',
  });

  return {
    distinctStayAllowedBy: data ? data.distinctStayAllowedBy : null,
    distinctStayAllowedByLoading: loading,
  };
};

export default useDistinctStayAllowedBy;
