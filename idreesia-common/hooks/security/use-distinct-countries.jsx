import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query distinctCountries {
    distinctCountries
  }
`;

const useDistinctCountries = () => {
  const { data, loading } = useQuery(QUERY, {
    fetchPolicy: 'no-cache',
  });

  return {
    distinctCountries: data ? data.distinctCountries : null,
    distinctCountriesLoading: loading,
  };
};

export default useDistinctCountries;
