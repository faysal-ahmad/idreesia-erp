import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityUserGroupMutation,
  UpdateSecurityUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_USER_GROUP: TypedDocumentNode<UpdateSecurityUserGroupMutation, UpdateSecurityUserGroupMutationVariables> = gql`
  mutation updateSecurityUserGroup($_id: String!, $name: String!, $description: String) {
    updateSecurityUserGroup(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default UPDATE_SECURITY_USER_GROUP;
