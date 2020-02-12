import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query allCities {
    allCities {
      _id
      name
      country
    }
  }
`;

const useAllCities = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    allCities: data ? data.allCities : null,
    allCitiesLoading: loading,
  };
};

export default useAllCities;
