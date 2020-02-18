import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query allMSDuties {
    allMSDuties {
      _id
      name
    }
  }
`;

const useAllMSDuties = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    allMSDuties: data ? data.allMSDuties : null,
    allMSDutiesLoading: loading,
  };
};

export default useAllMSDuties;
