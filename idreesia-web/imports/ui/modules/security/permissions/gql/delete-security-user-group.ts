import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteSecurityUserGroupMutation,
  DeleteSecurityUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_SECURITY_USER_GROUP: TypedDocumentNode<DeleteSecurityUserGroupMutation, DeleteSecurityUserGroupMutationVariables> = gql`
  mutation deleteSecurityUserGroup($_id: String!) {
    deleteSecurityUserGroup(_id: $_id)
  }
`;

export default DELETE_SECURITY_USER_GROUP;
