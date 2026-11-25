import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemovePhysicalStoreAccessUserMutation,
  RemovePhysicalStoreAccessUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_PHYSICAL_STORE_ACCESS_USER: TypedDocumentNode<
  RemovePhysicalStoreAccessUserMutation,
  RemovePhysicalStoreAccessUserMutationVariables
> = gql`
  mutation removePhysicalStoreAccessUser(
    $physicalStoreId: String!
    $permission: String!
    $userId: String!
  ) {
    removePhysicalStoreAccessUser(
      physicalStoreId: $physicalStoreId
      permission: $permission
      userId: $userId
    )
  }
`;

export default REMOVE_PHYSICAL_STORE_ACCESS_USER;
