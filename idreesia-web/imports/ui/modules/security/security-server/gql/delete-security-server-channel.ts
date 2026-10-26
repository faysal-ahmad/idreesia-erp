import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteSecurityServerChannelMutation,
  DeleteSecurityServerChannelMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_SECURITY_SERVER_CHANNEL: TypedDocumentNode<
  DeleteSecurityServerChannelMutation,
  DeleteSecurityServerChannelMutationVariables
> = gql`
  mutation deleteSecurityServerChannel($_id: String!) {
    deleteSecurityServerChannel(_id: $_id)
  }
`;

export default DELETE_SECURITY_SERVER_CHANNEL;
