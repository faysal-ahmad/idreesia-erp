import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query allMehfilDuties {
    allMehfilDuties {
      _id
      name
    }
  }
`;

const useAllMehfilDuties = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    allMehfilDuties: data ? data.allMehfilDuties : null,
    allMehfilDutiesLoading: loading,
  };
};

export default useAllMehfilDuties;
