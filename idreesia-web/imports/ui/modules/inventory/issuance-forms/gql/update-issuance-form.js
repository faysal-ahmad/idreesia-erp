import gql from 'graphql-tag';

export const UPDATE_ISSUANCE_FORM = gql`
  mutation updateIssuanceForm(
    $_id: String!
    $issueDate: String!
    $issuedBy: String!
    $issuedTo: String!
    $handedOverTo: String
    $locationId: String
    $physicalStoreId: String!
    $items: [ItemWithQuantityInput]
    $notes: String
  ) {
    updateIssuanceForm(
      _id: $_id
      issueDate: $issueDate
      issuedBy: $issuedBy
      issuedTo: $issuedTo
      handedOverTo: $handedOverTo
      locationId: $locationId
      physicalStoreId: $physicalStoreId
      items: $items
      notes: $notes
    ) {
      _id
      issueDate
      locationId
      physicalStoreId
      createdAt
      createdBy
      updatedAt
      updatedBy
      items {
        stockItemId
        quantity
        isInflow
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
    }
  }
`;
