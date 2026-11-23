import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CancelPurchasingOrderMutation,
  CancelPurchasingOrderMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CANCEL_PURCHASING_ORDER: TypedDocumentNode<
  CancelPurchasingOrderMutation,
  CancelPurchasingOrderMutationVariables
> = gql`
  mutation cancelPurchasingOrder($_id: String!) {
    cancelPurchasingOrder(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default CANCEL_PURCHASING_ORDER;
