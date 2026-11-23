import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemovePurchasingVendorMutation,
  RemovePurchasingVendorMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_PURCHASING_VENDOR: TypedDocumentNode<
  RemovePurchasingVendorMutation,
  RemovePurchasingVendorMutationVariables
> = gql`
  mutation removePurchasingVendor($_id: String!) {
    removePurchasingVendor(_id: $_id)
  }
`;

export default REMOVE_PURCHASING_VENDOR;
