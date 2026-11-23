import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetPurchasingInvoiceDisputedMutation,
  SetPurchasingInvoiceDisputedMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_PURCHASING_INVOICE_DISPUTED: TypedDocumentNode<
  SetPurchasingInvoiceDisputedMutation,
  SetPurchasingInvoiceDisputedMutationVariables
> = gql`
  mutation setPurchasingInvoiceDisputed($_id: String!, $isDisputed: Boolean!) {
    setPurchasingInvoiceDisputed(_id: $_id, isDisputed: $isDisputed) {
      _id
      isDisputed
    }
  }
`;

export default SET_PURCHASING_INVOICE_DISPUTED;
