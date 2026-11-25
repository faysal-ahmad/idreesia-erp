import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedStoreRequisitionsQuery,
  PagedStoreRequisitionsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PAGED_STORE_REQUISITIONS: TypedDocumentNode<
  PagedStoreRequisitionsQuery,
  PagedStoreRequisitionsQueryVariables
> = gql`
  query pagedStoreRequisitions(
    $physicalStoreId: String!
    $search: String
    $status: String
    $pageIndex: Int
    $pageSize: Int
  ) {
    pagedStoreRequisitions(
      physicalStoreId: $physicalStoreId
      search: $search
      status: $status
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        number
        title
        neededBy
        status
        createdAt
        requestedByPerson {
          _id
          sharedData {
            name
          }
        }
        lines {
          _id
        }
      }
    }
  }
`;
