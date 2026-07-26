import gql from 'graphql-tag';

export const PAGED_PURCHASE_FORMS = gql`
  query pagedPurchaseForms($physicalStoreId: String!, $queryString: String) {
    pagedPurchaseForms(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      data {
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
          refStockItem {
            _id
            name
            unitOfMeasurement
          }
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
