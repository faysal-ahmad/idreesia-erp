import { useEffect } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  LocationsByPhysicalStoreIdQuery,
  LocationsByPhysicalStoreIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const QUERY: TypedDocumentNode<
  LocationsByPhysicalStoreIdQuery,
  LocationsByPhysicalStoreIdQueryVariables
> = gql`
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

export const usePhysicalStoreLocations = (physicalStoreId: string) => {
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
    locationsByPhysicalStoreId: data?.locationsByPhysicalStoreId ?? null,
    locationsByPhysicalStoreIdLoading: loading,
  };
};
