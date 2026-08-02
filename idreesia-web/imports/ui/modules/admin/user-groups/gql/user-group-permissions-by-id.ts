import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UserGroupPermissionsByIdQuery,
  UserGroupPermissionsByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const USER_GROUP_PERMISSIONS_BY_ID: TypedDocumentNode<
  UserGroupPermissionsByIdQuery,
  UserGroupPermissionsByIdQueryVariables
> = gql`
  query userGroupPermissionsById($_id: String!) {
    userGroupById(_id: $_id) {
      _id
      permissions
    }
  }
`;

export default USER_GROUP_PERMISSIONS_BY_ID;
