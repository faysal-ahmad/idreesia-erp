import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingOrderFromQuoteMutation,
  CreatePurchasingOrderFromQuoteMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PURCHASING_ORDER_FROM_QUOTE: TypedDocumentNode<
  CreatePurchasingOrderFromQuoteMutation,
  CreatePurchasingOrderFromQuoteMutationVariables
> = gql`
  mutation createPurchasingOrderFromQuote($quoteId: String!) {
    createPurchasingOrderFromQuote(quoteId: $quoteId) {
      _id
    }
  }
`;

export default CREATE_PURCHASING_ORDER_FROM_QUOTE;
