import gql from 'graphql-tag';

export const PURCHASE_FORM_BY_ID = gql`
  query purchaseFormById($_id: String!) {
    purchaseFormById(_id: $_id) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      physicalStoreId
      locationId
      vendorId
      approvedOn
      createdAt
      createdBy
      updatedAt
      updatedBy
      items {
        stockItemId
        quantity
        isInflow
        price
      }
      attachments {
        _id
        name
        description
        mimeType
      }
      refReceivedBy {
        _id
        name
      }
      refPurchasedBy {
        _id
        name
      }
      refVendor {
        _id
        name
      }
      refLocation {
        _id
        name
      }
      notes
    }
  }
`;
