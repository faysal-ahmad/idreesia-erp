import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

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

export const usePhysicalStoreItemCategories = physicalStoreId => {
  const { data, loading, refetch } = useQuery(QUERY, {
    variables: {
      physicalStoreId,
    },
  });

  useEffect(() => {
    refetch();
  }, [physicalStoreId]);

  return {
    itemCategoriesByPhysicalStoreId: data
      ? data.itemCategoriesByPhysicalStoreId
      : null,
    itemCategoriesByPhysicalStoreIdLoading: loading,
  };
};
