import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ApprovePurchasingOrderMutation,
  ApprovePurchasingOrderMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const APPROVE_PURCHASING_ORDER: TypedDocumentNode<
  ApprovePurchasingOrderMutation,
  ApprovePurchasingOrderMutationVariables
> = gql`
  mutation approvePurchasingOrder($_id: String!) {
    approvePurchasingOrder(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default APPROVE_PURCHASING_ORDER;
