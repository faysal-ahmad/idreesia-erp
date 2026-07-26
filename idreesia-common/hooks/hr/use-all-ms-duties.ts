import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

interface MSDutyOption {
  _id: string;
  name: string;
}

interface AllMSDutiesData {
  allMSDuties: MSDutyOption[];
}

const QUERY = gql`
  query allMSDuties {
    allMSDuties {
      _id
      name
    }
  }
`;

const useAllMSDuties = () => {
  const { data, loading } = useQuery<AllMSDutiesData>(QUERY);
  return {
    allMSDuties: data ? data.allMSDuties : null,
    allMSDutiesLoading: loading,
  };
};

export default useAllMSDuties;
