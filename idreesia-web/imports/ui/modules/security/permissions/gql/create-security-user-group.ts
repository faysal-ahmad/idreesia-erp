import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSecurityUserGroupMutation,
  CreateSecurityUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SECURITY_USER_GROUP: TypedDocumentNode<CreateSecurityUserGroupMutation, CreateSecurityUserGroupMutationVariables> = gql`
  mutation createSecurityUserGroup($name: String!, $description: String) {
    createSecurityUserGroup(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default CREATE_SECURITY_USER_GROUP;
