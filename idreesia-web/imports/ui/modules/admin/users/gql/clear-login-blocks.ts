import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ClearLoginBlocksMutation,
  ClearLoginBlocksMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CLEAR_LOGIN_BLOCKS: TypedDocumentNode<
  ClearLoginBlocksMutation,
  ClearLoginBlocksMutationVariables
> = gql`
  mutation clearLoginBlocks($userId: String!) {
    clearLoginBlocks(userId: $userId) {
      _id
      loginBlockedAddresses
      untrustedLoginAddressesBlocked
    }
  }
`;

export default CLEAR_LOGIN_BLOCKS;
