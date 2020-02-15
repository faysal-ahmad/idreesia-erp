import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query distinctRegions {
    distinctRegions
  }
`;

const useDistinctRegions = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    distinctRegions: data ? data.distinctRegions : null,
    distinctRegionsLoading: loading,
  };
};

export default useDistinctRegions;
