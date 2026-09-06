import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchaseFormsQuery,
  PagedPurchaseFormsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PAGED_PURCHASE_FORMS: TypedDocumentNode<
  PagedPurchaseFormsQuery,
  PagedPurchaseFormsQueryVariables
> = gql`
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
          sharedData {
            name
          }
        }
        refPurchasedBy {
          _id
          sharedData {
            name
          }
        }
        refLocation {
          _id
          name
        }
      }
    }
  }
`;
