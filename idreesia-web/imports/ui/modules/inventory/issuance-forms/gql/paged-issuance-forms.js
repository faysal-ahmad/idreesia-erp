import gql from 'graphql-tag';

export const PAGED_ISSUANCE_FORMS = gql`
  query pagedIssuanceForms($physicalStoreId: String!, $queryString: String) {
    pagedIssuanceForms(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      issuanceForms {
        _id
        issueDate
        issuedBy
        issuedTo
        handedOverTo
        locationId
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
        refIssuedTo {
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
