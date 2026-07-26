import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

interface CityMehfilOption {
  _id: string;
  cityId: string;
  name: string;
  address?: string | null;
}

interface AllCityMehfilsData {
  allCityMehfils: CityMehfilOption[];
}

const QUERY = gql`
  query allCityMehfils {
    allCityMehfils {
      _id
      cityId
      name
      address
    }
  }
`;

const useAllCityMehfils = () => {
  const { data, loading } = useQuery<AllCityMehfilsData>(QUERY);
  return {
    allCityMehfils: data ? data.allCityMehfils : null,
    allCityMehfilsLoading: loading,
  };
};

export default useAllCityMehfils;
