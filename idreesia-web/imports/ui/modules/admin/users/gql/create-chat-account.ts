import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateChatAccountMutation,
  CreateChatAccountMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_CHAT_ACCOUNT: TypedDocumentNode<
  CreateChatAccountMutation,
  CreateChatAccountMutationVariables
> = gql`
  mutation createChatAccount($userId: String!) {
    createChatAccount(userId: $userId) {
      _id
      username
      hasChatAccount
    }
  }
`;

export default CREATE_CHAT_ACCOUNT;
