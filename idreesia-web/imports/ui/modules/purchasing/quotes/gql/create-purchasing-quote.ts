import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingQuoteMutation,
  CreatePurchasingQuoteMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PURCHASING_QUOTE: TypedDocumentNode<
  CreatePurchasingQuoteMutation,
  CreatePurchasingQuoteMutationVariables
> = gql`
  mutation createPurchasingQuote($requisitionId: String, $vendorId: String!, $reference: String, $quoteDate: String!, $validUntil: String, $notes: String, $lines: [PurchasingPricedLineInput!]!) {
    createPurchasingQuote(requisitionId: $requisitionId, vendorId: $vendorId, reference: $reference, quoteDate: $quoteDate, validUntil: $validUntil, notes: $notes, lines: $lines) {
      _id
    }
  }
`;

export default CREATE_PURCHASING_QUOTE;
