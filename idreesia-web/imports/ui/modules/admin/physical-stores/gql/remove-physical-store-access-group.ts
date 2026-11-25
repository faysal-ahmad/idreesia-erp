import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemovePhysicalStoreAccessGroupMutation,
  RemovePhysicalStoreAccessGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_PHYSICAL_STORE_ACCESS_GROUP: TypedDocumentNode<
  RemovePhysicalStoreAccessGroupMutation,
  RemovePhysicalStoreAccessGroupMutationVariables
> = gql`
  mutation removePhysicalStoreAccessGroup(
    $physicalStoreId: String!
    $permission: String!
    $groupId: String!
  ) {
    removePhysicalStoreAccessGroup(
      physicalStoreId: $physicalStoreId
      permission: $permission
      groupId: $groupId
    )
  }
`;

export default REMOVE_PHYSICAL_STORE_ACCESS_GROUP;
