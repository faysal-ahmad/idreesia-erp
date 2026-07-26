import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

interface CityOption {
  _id: string;
  name: string;
  peripheryOf?: string | null;
  country?: string | null;
}

interface AllCitiesData {
  allCities: CityOption[];
}

const QUERY = gql`
  query allCities {
    allCities {
      _id
      name
      peripheryOf
      country
    }
  }
`;

const useAllCities = () => {
  const { data, loading } = useQuery<AllCitiesData>(QUERY);
  return {
    allCities: data ? data.allCities : null,
    allCitiesLoading: loading,
  };
};

export default useAllCities;
