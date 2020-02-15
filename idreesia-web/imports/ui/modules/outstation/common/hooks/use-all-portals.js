import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query allPortals {
    allPortals {
      _id
      name
      cityIds
    }
  }
`;

const useAllPortals = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    allPortals: data ? data.allPortals : null,
    allPortalsLoading: loading,
  };
};

export default useAllPortals;
