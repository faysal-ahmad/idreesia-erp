import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query vendorsByPhysicalStoreId($physicalStoreId: String!) {
    vendorsByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
      _id
      name
      physicalStoreId
      contactPerson
      contactNumber
      address
      notes
      usageCount
    }
  }
`;

export const usePhysicalStoreVendors = physicalStoreId => {
  const { data, loading, refetch } = useQuery(QUERY, {
    variables: {
      physicalStoreId,
    },
  });

  useEffect(() => {
    refetch();
  }, [physicalStoreId]);

  return {
    vendorsByPhysicalStoreId: data ? data.vendorsByPhysicalStoreId : null,
    vendorsByPhysicalStoreIdLoading: loading,
  };
};
