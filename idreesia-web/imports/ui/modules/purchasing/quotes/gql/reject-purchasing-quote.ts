import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RejectPurchasingQuoteMutation,
  RejectPurchasingQuoteMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REJECT_PURCHASING_QUOTE: TypedDocumentNode<
  RejectPurchasingQuoteMutation,
  RejectPurchasingQuoteMutationVariables
> = gql`
  mutation rejectPurchasingQuote($_id: String!) {
    rejectPurchasingQuote(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default REJECT_PURCHASING_QUOTE;
