import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

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

interface Vendor {
  _id: string;
  name: string;
  [key: string]: unknown;
}

interface PhysicalStoreVendorsQueryData {
  vendorsByPhysicalStoreId: Vendor[] | null;
}

export const usePhysicalStoreVendors = (physicalStoreId: string) => {
  const { data, loading, refetch } = useQuery(QUERY as any, {
    variables: {
      physicalStoreId,
    },
  });

  useEffect(() => {
    refetch();
  }, [physicalStoreId, refetch]);

  return {
    vendorsByPhysicalStoreId: (
      data as PhysicalStoreVendorsQueryData | undefined
    )?.vendorsByPhysicalStoreId ?? null,
    vendorsByPhysicalStoreIdLoading: loading,
  };
};
