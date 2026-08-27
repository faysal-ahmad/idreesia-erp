import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AdminUserByIdQuery,
  AdminUserByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const USER_BY_ID: TypedDocumentNode<
  AdminUserByIdQuery,
  AdminUserByIdQueryVariables
> = gql`
  query adminUserById($_id: String!) {
    userById(_id: $_id) {
      _id
      username
      email
      displayName
      locked
      instances
      permissions
      personId
      karkun {
        _id
        sharedData {
          name
        }
      }
    }
  }
`;

export default USER_BY_ID;
