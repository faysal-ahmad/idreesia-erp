import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetSuperAdminMutation,
  SetSuperAdminMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_SUPER_ADMIN: TypedDocumentNode<
  SetSuperAdminMutation,
  SetSuperAdminMutationVariables
> = gql`
  mutation setSuperAdmin($userId: String!, $isSuperAdmin: Boolean!) {
    setSuperAdmin(userId: $userId, isSuperAdmin: $isSuperAdmin) {
      _id
      isSuperAdmin
      permissions
    }
  }
`;

export default SET_SUPER_ADMIN;
