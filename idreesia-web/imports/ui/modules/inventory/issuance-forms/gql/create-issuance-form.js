import gql from 'graphql-tag';

export const CREATE_ISSUANCE_FORM = gql`
  mutation createIssuanceForm(
    $issueDate: String!
    $issuedBy: String!
    $issuedTo: String!
    $handedOverTo: String
    $physicalStoreId: String!
    $locationId: String
    $items: [ItemWithQuantityInput]
    $notes: String
  ) {
    createIssuanceForm(
      issueDate: $issueDate
      issuedBy: $issuedBy
      issuedTo: $issuedTo
      handedOverTo: $handedOverTo
      physicalStoreId: $physicalStoreId
      locationId: $locationId
      items: $items
      notes: $notes
    ) {
      _id
      issueDate
      physicalStoreId
      locationId
      items {
        stockItemId
        quantity
        isInflow
      }
      notes
    }
  }
`;
