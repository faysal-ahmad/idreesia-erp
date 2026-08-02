import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedIssuanceFormsQuery,
  PagedIssuanceFormsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PAGED_ISSUANCE_FORMS: TypedDocumentNode<
  PagedIssuanceFormsQuery,
  PagedIssuanceFormsQueryVariables
> = gql`
  query pagedIssuanceForms($physicalStoreId: String!, $queryString: String) {
    pagedIssuanceForms(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      data {
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
