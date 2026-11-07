import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SendInboxMessageMutation,
  SendInboxMessageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SEND_INBOX_MESSAGE: TypedDocumentNode<
  SendInboxMessageMutation,
  SendInboxMessageMutationVariables
> = gql`
  mutation sendInboxMessage($roomId: String!, $text: String!) {
    sendInboxMessage(roomId: $roomId, text: $text) {
      _id
    }
  }
`;

export default SEND_INBOX_MESSAGE;
