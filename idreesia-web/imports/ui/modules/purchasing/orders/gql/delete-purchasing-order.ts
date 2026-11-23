import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeletePurchasingOrderMutation,
  DeletePurchasingOrderMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_PURCHASING_ORDER: TypedDocumentNode<
  DeletePurchasingOrderMutation,
  DeletePurchasingOrderMutationVariables
> = gql`
  mutation deletePurchasingOrder($_id: String!) {
    deletePurchasingOrder(_id: $_id)
  }
`;

export default DELETE_PURCHASING_ORDER;
