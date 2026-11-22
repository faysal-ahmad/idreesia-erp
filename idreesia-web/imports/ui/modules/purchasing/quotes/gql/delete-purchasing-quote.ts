import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeletePurchasingQuoteMutation,
  DeletePurchasingQuoteMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_PURCHASING_QUOTE: TypedDocumentNode<
  DeletePurchasingQuoteMutation,
  DeletePurchasingQuoteMutationVariables
> = gql`
  mutation deletePurchasingQuote($_id: String!) {
    deletePurchasingQuote(_id: $_id)
  }
`;

export default DELETE_PURCHASING_QUOTE;
