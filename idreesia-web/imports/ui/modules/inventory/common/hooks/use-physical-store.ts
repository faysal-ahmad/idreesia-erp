import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

const QUERY = gql`
  query physicalStoreById($id: String!) {
    physicalStoreById(id: $id) {
      _id
      name
    }
  }
`;

interface PhysicalStore {
  _id: string;
  name: string;
}

interface PhysicalStoreQueryData {
  physicalStoreById: PhysicalStore | null;
}

export const usePhysicalStore = (physicalStoreId: string) => {
  const { data, loading, refetch } = useQuery(QUERY as any, {
    variables: {
      id: physicalStoreId,
    },
  });

  useEffect(() => {
    refetch();
  }, [physicalStoreId, refetch]);

  return {
    physicalStore: (data as PhysicalStoreQueryData | undefined)
      ?.physicalStoreById ?? null,
    physicalStoreLoading: loading,
  };
};
