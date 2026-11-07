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
    $userName: String
    $password: String
    $email: String
    $displayName: String
    $locked: Boolean
  ) {
    updateUser(
      userId: $userId
      userName: $userName
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
      hasChatAccount
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
