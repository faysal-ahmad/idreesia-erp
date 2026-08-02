import { useEffect } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  ItemCategoriesByPhysicalStoreIdQuery,
  ItemCategoriesByPhysicalStoreIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const QUERY: TypedDocumentNode<
  ItemCategoriesByPhysicalStoreIdQuery,
  ItemCategoriesByPhysicalStoreIdQueryVariables
> = gql`
  query itemCategoriesByPhysicalStoreId($physicalStoreId: String!) {
    itemCategoriesByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
      _id
      name
      physicalStoreId
      stockItemCount
    }
  }
`;

export const usePhysicalStoreItemCategories = (physicalStoreId: string) => {
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
    itemCategoriesByPhysicalStoreId: data?.itemCategoriesByPhysicalStoreId ?? null,
    itemCategoriesByPhysicalStoreIdLoading: loading,
  };
};
