import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

const QUERY = gql`
  query locationsByPhysicalStoreId($physicalStoreId: String!) {
    locationsByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
      _id
      name
      physicalStoreId
      parentId
      description
      isInUse
      refParent {
        _id
        name
      }
    }
  }
`;

interface Location {
  _id: string;
  name: string;
  [key: string]: unknown;
}

interface PhysicalStoreLocationsQueryData {
  locationsByPhysicalStoreId: Location[] | null;
}

export const usePhysicalStoreLocations = (physicalStoreId: string) => {
  const { data, loading, refetch } = useQuery(QUERY as any, {
    variables: {
      physicalStoreId,
    },
  });

  useEffect(() => {
    refetch();
  }, [physicalStoreId, refetch]);

  return {
    locationsByPhysicalStoreId: (
      data as PhysicalStoreLocationsQueryData | undefined
    )?.locationsByPhysicalStoreId ?? null,
    locationsByPhysicalStoreIdLoading: loading,
  };
};
