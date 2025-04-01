import gql from 'graphql-tag';

export const PAGED_PURCHASE_FORMS = gql`
  query pagedPurchaseForms($physicalStoreId: String!, $queryString: String) {
    pagedPurchaseForms(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      purchaseForms {
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
          stockItemName
          unitOfMeasurement
        }
        attachments {
          _id
          name
        }
        refReceivedBy {
          _id
          name
        }
        refPurchasedBy {
          _id
          name
        }
        refLocation {
          _id
          name
        }
      }
    }
  }
`;
