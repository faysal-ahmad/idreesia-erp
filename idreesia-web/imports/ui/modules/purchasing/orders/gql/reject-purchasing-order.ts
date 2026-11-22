import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RejectPurchasingOrderMutation,
  RejectPurchasingOrderMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REJECT_PURCHASING_ORDER: TypedDocumentNode<
  RejectPurchasingOrderMutation,
  RejectPurchasingOrderMutationVariables
> = gql`
  mutation rejectPurchasingOrder($_id: String!, $reason: String!) {
    rejectPurchasingOrder(_id: $_id, reason: $reason) {
      _id
      status
      version
    }
  }
`;

export default REJECT_PURCHASING_ORDER;
