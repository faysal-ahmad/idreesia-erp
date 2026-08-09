import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ApprovePurchaseFormsMutation,
  ApprovePurchaseFormsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const APPROVE_PURCHASE_FORMS: TypedDocumentNode<
  ApprovePurchaseFormsMutation,
  ApprovePurchaseFormsMutationVariables
> = gql`
  mutation approvePurchaseForms($physicalStoreId: String!, $_ids: [String]!) {
    approvePurchaseForms(physicalStoreId: $physicalStoreId, _ids: $_ids) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
      }
    }
  }
`;
