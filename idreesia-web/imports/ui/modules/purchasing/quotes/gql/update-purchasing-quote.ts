import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdatePurchasingQuoteMutation,
  UpdatePurchasingQuoteMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_PURCHASING_QUOTE: TypedDocumentNode<
  UpdatePurchasingQuoteMutation,
  UpdatePurchasingQuoteMutationVariables
> = gql`
  mutation updatePurchasingQuote($_id: String!, $version: Int!, $requisitionId: String, $vendorId: String!, $reference: String, $quoteDate: String!, $validUntil: String, $notes: String, $lines: [PurchasingPricedLineInput!]!) {
    updatePurchasingQuote(_id: $_id, version: $version, requisitionId: $requisitionId, vendorId: $vendorId, reference: $reference, quoteDate: $quoteDate, validUntil: $validUntil, notes: $notes, lines: $lines) {
      _id
      version
    }
  }
`;

export default UPDATE_PURCHASING_QUOTE;
