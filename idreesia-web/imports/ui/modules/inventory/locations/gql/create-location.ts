import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateLocationMutation,
  CreateLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const CREATE_LOCATION: TypedDocumentNode<
  CreateLocationMutation,
  CreateLocationMutationVariables
> = gql`
  mutation createLocation(
    $name: String!
    $physicalStoreId: String!
    $parentId: String
    $description: String
  ) {
    createLocation(
      name: $name
      physicalStoreId: $physicalStoreId
      parentId: $parentId
      description: $description
    ) {
      _id
      name
      parentId
      description
    }
  }
`;
