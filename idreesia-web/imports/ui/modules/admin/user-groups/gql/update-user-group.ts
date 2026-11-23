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
    $moduleName: String
    $description: String
  ) {
    updateUserGroup(
      _id: $_id
      name: $name
      moduleName: $moduleName
      description: $description
    ) {
      _id
      name
      moduleName
      description
    }
  }
`;

export default UPDATE_USER_GROUP;
