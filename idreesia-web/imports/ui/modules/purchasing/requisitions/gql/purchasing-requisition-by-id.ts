import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingRequisitionByIdQuery,
  PurchasingRequisitionByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_REQUISITION_BY_ID: TypedDocumentNode<
  PurchasingRequisitionByIdQuery,
  PurchasingRequisitionByIdQueryVariables
> = gql`
  query purchasingRequisitionById($_id: String!) {
    purchasingRequisitionById(_id: $_id) {
      _id
      number
      title
      purpose
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
      lines {
        _id
        catalogItemId
        description
        unit
        quantity
        estimatedUnitPrice
      }
      submittedAt
      approvedAt
      approvedBy
      rejectedAt
      rejectionReason
      cancelledAt
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default PURCHASING_REQUISITION_BY_ID;
