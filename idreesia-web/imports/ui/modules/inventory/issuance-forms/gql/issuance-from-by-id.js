import gql from 'graphql-tag';

export const ISSUANCE_FORM_BY_ID = gql`
  query issuanceFormById($_id: String!) {
    issuanceFormById(_id: $_id) {
      _id
      issueDate
      issuedBy
      issuedTo
      handedOverTo
      locationId
      physicalStoreId
      createdAt
      createdBy
      updatedAt
      updatedBy
      approvedOn
      approvedBy
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
      refLocation {
        _id
        name
      }
      refIssuedBy {
        _id
        name
      }
      refIssuedTo {
        _id
        name
      }
      notes
      attachments {
        _id
        name
        description
        mimeType
      }
    }
  }
`;
