import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query distinctCities {
    distinctCities
  }
`;

const useDistinctCities = () => {
  const { data, loading } = useQuery(QUERY, {
    fetchPolicy: 'no-cache',
  });

  return {
    distinctCities: data ? data.distinctCities : null,
    distinctCitiesLoading: loading,
  };
};

export default useDistinctCities;
