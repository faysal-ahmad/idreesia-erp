import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SelectPurchasingQuoteMutation,
  SelectPurchasingQuoteMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SELECT_PURCHASING_QUOTE: TypedDocumentNode<
  SelectPurchasingQuoteMutation,
  SelectPurchasingQuoteMutationVariables
> = gql`
  mutation selectPurchasingQuote($_id: String!) {
    selectPurchasingQuote(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default SELECT_PURCHASING_QUOTE;
