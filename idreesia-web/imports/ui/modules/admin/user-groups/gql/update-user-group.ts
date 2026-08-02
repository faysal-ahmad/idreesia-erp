import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateUserGroupMutation,
  UpdateUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_USER_GROUP: TypedDocumentNode<
  UpdateUserGroupMutation,
  UpdateUserGroupMutationVariables
> = gql`
  mutation updateUserGroup(
    $_id: String!
    $name: String!
    $description: String
  ) {
    updateUserGroup(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default UPDATE_USER_GROUP;
