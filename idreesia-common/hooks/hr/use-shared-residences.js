import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query allSharedResidences {
    allSharedResidences {
      _id
      name
      address
      owner {
        _id
        name
      }
    }
  }
`;

const useAllSharedResidences = (fetchPolicy = 'no-cache') => {
  const { data, loading, refetch } = useQuery(QUERY, {
    fetchPolicy,
  });

  return {
    allSharedResidences: data ? data.allSharedResidences : null,
    allSharedResidencesLoading: loading,
    allSharedResidencesRefetch: refetch,
  };
};

export default useAllSharedResidences;
