import { useEffect } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  UseInventoryPhysicalStoreByIdQuery,
  UseInventoryPhysicalStoreByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const QUERY: TypedDocumentNode<
  UseInventoryPhysicalStoreByIdQuery,
  UseInventoryPhysicalStoreByIdQueryVariables
> = gql`
  query useInventoryPhysicalStoreById($id: String!) {
    physicalStoreById(id: $id) {
      _id
      name
    }
  }
`;

export const usePhysicalStore = (physicalStoreId: string) => {
  const { data, loading, refetch } = useQuery(QUERY, {
    variables: {
      id: physicalStoreId,
    },
    skip: !physicalStoreId,
  });

  useEffect(() => {
    if (physicalStoreId) {
      refetch();
    }
  }, [physicalStoreId, refetch]);

  return {
    physicalStore: data?.physicalStoreById ?? null,
    physicalStoreLoading: loading,
  };
};
