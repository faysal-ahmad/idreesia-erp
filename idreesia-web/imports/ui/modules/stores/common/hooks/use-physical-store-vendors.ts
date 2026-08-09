import { useEffect } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  VendorsByPhysicalStoreIdQuery,
  VendorsByPhysicalStoreIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const QUERY: TypedDocumentNode<
  VendorsByPhysicalStoreIdQuery,
  VendorsByPhysicalStoreIdQueryVariables
> = gql`
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

export const usePhysicalStoreVendors = (physicalStoreId: string) => {
  const { data, loading, refetch } = useQuery(QUERY, {
    variables: {
      physicalStoreId,
    },
    skip: !physicalStoreId,
  });

  useEffect(() => {
    if (physicalStoreId) {
      refetch();
    }
  }, [physicalStoreId, refetch]);

  return {
    vendorsByPhysicalStoreId: data?.vendorsByPhysicalStoreId ?? null,
    vendorsByPhysicalStoreIdLoading: loading,
  };
};
