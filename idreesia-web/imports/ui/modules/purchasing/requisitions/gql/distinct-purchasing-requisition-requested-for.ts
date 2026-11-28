import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DistinctPurchasingRequisitionRequestedForQuery,
  DistinctPurchasingRequisitionRequestedForQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DISTINCT_PURCHASING_REQUISITION_REQUESTED_FOR: TypedDocumentNode<
  DistinctPurchasingRequisitionRequestedForQuery,
  DistinctPurchasingRequisitionRequestedForQueryVariables
> = gql`
  query distinctPurchasingRequisitionRequestedFor {
    distinctPurchasingRequisitionRequestedFor
  }
`;

export default DISTINCT_PURCHASING_REQUISITION_REQUESTED_FOR;
