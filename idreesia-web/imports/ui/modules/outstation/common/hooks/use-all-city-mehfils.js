import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

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
  const { data, loading } = useQuery(QUERY);
  return {
    allCityMehfils: data ? data.allCityMehfils : null,
    allCityMehfilsLoading: loading,
  };
};

export default useAllCityMehfils;
