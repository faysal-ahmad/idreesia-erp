import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MarkPurchasingOrderSentMutation,
  MarkPurchasingOrderSentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const MARK_PURCHASING_ORDER_SENT: TypedDocumentNode<
  MarkPurchasingOrderSentMutation,
  MarkPurchasingOrderSentMutationVariables
> = gql`
  mutation markPurchasingOrderSent($_id: String!) {
    markPurchasingOrderSent(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default MARK_PURCHASING_ORDER_SENT;
