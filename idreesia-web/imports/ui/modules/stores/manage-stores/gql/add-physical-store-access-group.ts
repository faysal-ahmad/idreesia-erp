import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddPhysicalStoreAccessGroupMutation,
  AddPhysicalStoreAccessGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_PHYSICAL_STORE_ACCESS_GROUP: TypedDocumentNode<
  AddPhysicalStoreAccessGroupMutation,
  AddPhysicalStoreAccessGroupMutationVariables
> = gql`
  mutation addPhysicalStoreAccessGroup(
    $physicalStoreId: String!
    $permission: String!
    $groupId: String!
  ) {
    addPhysicalStoreAccessGroup(
      physicalStoreId: $physicalStoreId
      permission: $permission
      groupId: $groupId
    )
  }
`;

export default ADD_PHYSICAL_STORE_ACCESS_GROUP;
