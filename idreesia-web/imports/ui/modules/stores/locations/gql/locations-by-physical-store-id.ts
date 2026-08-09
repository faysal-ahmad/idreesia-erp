import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  LocationsByPhysicalStoreIdQuery,
  LocationsByPhysicalStoreIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const LOCATIONS_BY_PHYSICAL_STORE_ID: TypedDocumentNode<
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
