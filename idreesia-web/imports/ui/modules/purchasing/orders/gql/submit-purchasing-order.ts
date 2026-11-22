import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SubmitPurchasingOrderMutation,
  SubmitPurchasingOrderMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SUBMIT_PURCHASING_ORDER: TypedDocumentNode<
  SubmitPurchasingOrderMutation,
  SubmitPurchasingOrderMutationVariables
> = gql`
  mutation submitPurchasingOrder($_id: String!) {
    submitPurchasingOrder(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default SUBMIT_PURCHASING_ORDER;
