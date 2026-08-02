import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateLocationMutation,
  UpdateLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const UPDATE_LOCATION: TypedDocumentNode<
  UpdateLocationMutation,
  UpdateLocationMutationVariables
> = gql`
  mutation updateLocation(
    $_id: String!
    $physicalStoreId: String!
    $name: String!
    $parentId: String
    $description: String
  ) {
    updateLocation(
      _id: $_id
      physicalStoreId: $physicalStoreId
      name: $name
      parentId: $parentId
      description: $description
    ) {
      _id
      name
      parentId
      description
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
