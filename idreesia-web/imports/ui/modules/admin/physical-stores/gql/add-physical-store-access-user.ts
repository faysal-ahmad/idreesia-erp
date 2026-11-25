import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddPhysicalStoreAccessUserMutation,
  AddPhysicalStoreAccessUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_PHYSICAL_STORE_ACCESS_USER: TypedDocumentNode<
  AddPhysicalStoreAccessUserMutation,
  AddPhysicalStoreAccessUserMutationVariables
> = gql`
  mutation addPhysicalStoreAccessUser(
    $physicalStoreId: String!
    $permission: String!
    $karkunId: String!
  ) {
    addPhysicalStoreAccessUser(
      physicalStoreId: $physicalStoreId
      permission: $permission
      karkunId: $karkunId
    )
  }
`;

export default ADD_PHYSICAL_STORE_ACCESS_USER;
