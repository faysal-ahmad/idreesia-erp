import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchasingRequisitionsQuery,
  PagedPurchasingRequisitionsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_PURCHASING_REQUISITIONS: TypedDocumentNode<
  PagedPurchasingRequisitionsQuery,
  PagedPurchasingRequisitionsQueryVariables
> = gql`
  query pagedPurchasingRequisitions($search: String, $status: String, $requestedBy: String, $source: String, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingRequisitions(search: $search, status: $status, requestedBy: $requestedBy, source: $source, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        number
        title
        status
        estimatedTotal
        neededBy
        requestedBy
        requestedByPerson {
          _id
          sharedData {
            name
          }
        }
        version
        createdAt
      }
    }
  }
`;

export default PAGED_PURCHASING_REQUISITIONS;
