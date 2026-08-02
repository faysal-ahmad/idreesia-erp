import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateUserGroupMutation,
  CreateUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_USER_GROUP: TypedDocumentNode<
  CreateUserGroupMutation,
  CreateUserGroupMutationVariables
> = gql`
  mutation createUserGroup(
    $name: String!
    $moduleName: String!
    $description: String
  ) {
    createUserGroup(
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

export default CREATE_USER_GROUP;
