import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityUserByIdQuery,
  SecurityUserByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const USER_BY_ID: TypedDocumentNode<
  SecurityUserByIdQuery,
  SecurityUserByIdQueryVariables
> = gql`
  query securityUserById($_id: String!) {
    userById(_id: $_id) {
      _id
      username
      email
      displayName
      locked
      instances
      permissions
      personId
      person {
        _id
        sharedData {
          name
        }
      }
    }
  }
`;

export default USER_BY_ID;
