import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_USER: TypedDocumentNode<
  UpdateUserMutation,
  UpdateUserMutationVariables
> = gql`
  mutation updateUser(
    $userId: String!
    $password: String
    $email: String
    $displayName: String
    $locked: Boolean
  ) {
    updateUser(
      userId: $userId
      password: $password
      email: $email
      displayName: $displayName
      locked: $locked
    ) {
      _id
      username
      email
      displayName
      locked
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

export default UPDATE_USER;
