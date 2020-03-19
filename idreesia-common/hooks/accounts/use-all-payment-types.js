import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query allPaymentTypes {
    allPaymentTypes {
      _id
      name
    }
  }
`;

const useAllPaymentTypes = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    allPaymentTypes: data ? data.allPaymentTypes : null,
    allPaymentTypesLoading: loading,
  };
};

export default useAllPaymentTypes;
