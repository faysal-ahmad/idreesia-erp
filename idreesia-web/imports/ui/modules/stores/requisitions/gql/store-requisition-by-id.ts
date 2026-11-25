import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  StoreRequisitionByIdQuery,
  StoreRequisitionByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const STORE_REQUISITION_BY_ID: TypedDocumentNode<
  StoreRequisitionByIdQuery,
  StoreRequisitionByIdQueryVariables
> = gql`
  query storeRequisitionById($physicalStoreId: String!, $_id: String!) {
    storeRequisitionById(physicalStoreId: $physicalStoreId, _id: $_id) {
      _id
      number
      title
      purpose
      requestedBy
      requestedByPerson {
        _id
        sharedData {
          name
        }
      }
      neededBy
      status
      version
      rejectionReason
      submittedAt
      approvedAt
      rejectedAt
      cancelledAt
      createdAt
      createdBy
      updatedAt
      updatedBy
      lines {
        _id
        externalCatalogId
        description
        unit
        quantity
      }
    }
  }
`;
