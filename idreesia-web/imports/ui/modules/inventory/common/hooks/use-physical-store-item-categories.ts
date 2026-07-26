import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

const QUERY = gql`
  query itemCategoriesByPhysicalStoreId($physicalStoreId: String!) {
    itemCategoriesByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
      _id
      name
      physicalStoreId
      stockItemCount
    }
  }
`;

interface ItemCategory {
  _id: string;
  name: string;
  [key: string]: unknown;
}

interface PhysicalStoreItemCategoriesQueryData {
  itemCategoriesByPhysicalStoreId: ItemCategory[] | null;
}

export const usePhysicalStoreItemCategories = (physicalStoreId: string) => {
  const { data, loading, refetch } = useQuery(QUERY as any, {
    variables: {
      physicalStoreId,
    },
  });

  useEffect(() => {
    refetch();
  }, [physicalStoreId, refetch]);

  return {
    itemCategoriesByPhysicalStoreId: (
      data as PhysicalStoreItemCategoriesQueryData | undefined
    )?.itemCategoriesByPhysicalStoreId ?? null,
    itemCategoriesByPhysicalStoreIdLoading: loading,
  };
};
