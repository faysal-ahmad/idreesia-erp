import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetPurchasingVendorActiveMutation,
  SetPurchasingVendorActiveMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_PURCHASING_VENDOR_ACTIVE: TypedDocumentNode<
  SetPurchasingVendorActiveMutation,
  SetPurchasingVendorActiveMutationVariables
> = gql`
  mutation setPurchasingVendorActive($_id: String!, $isActive: Boolean!) {
    setPurchasingVendorActive(_id: $_id, isActive: $isActive) {
      _id
      isActive
    }
  }
`;

export default SET_PURCHASING_VENDOR_ACTIVE;
