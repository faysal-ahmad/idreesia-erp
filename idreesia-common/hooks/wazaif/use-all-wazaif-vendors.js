import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query allWazaifVendors {
    allWazaifVendors {
      _id
      name
      contactPerson
      contactNumber
      address
      notes
    }
  }
`;

const useAllWazaifVendors = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    allWazaifVendors: data ? data.allWazaifVendors : null,
    allWazaifVendorsLoading: loading,
  };
};

export default useAllWazaifVendors;
