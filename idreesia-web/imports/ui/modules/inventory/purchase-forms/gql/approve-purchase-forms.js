import gql from 'graphql-tag';

export const APPROVE_PURCHASE_FORMS = gql`
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
