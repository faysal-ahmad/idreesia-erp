import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query allImdadReasons {
    allImdadReasons {
      _id
      name
    }
  }
`;

const useAllImdadReasons = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    allImdadReasons: data ? data.allImdadReasons : null,
    allImdadReasonsLoading: loading,
  };
};

export default useAllImdadReasons;
