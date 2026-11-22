import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ClosePurchasingOrderMutation,
  ClosePurchasingOrderMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CLOSE_PURCHASING_ORDER: TypedDocumentNode<
  ClosePurchasingOrderMutation,
  ClosePurchasingOrderMutationVariables
> = gql`
  mutation closePurchasingOrder($_id: String!) {
    closePurchasingOrder(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default CLOSE_PURCHASING_ORDER;
