import gql from 'graphql-tag';

export const APPROVE_ISSUANCE_FORMS = gql`
  mutation approveIssuanceForms($physicalStoreId: String!, $_ids: [String]!) {
    approveIssuanceForms(physicalStoreId: $physicalStoreId, _ids: $_ids) {
      _id
      issueDate
      issuedBy
      issuedTo
      locationId
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
      }
      refIssuedTo {
        _id
        name
      }
    }
  }
`;
