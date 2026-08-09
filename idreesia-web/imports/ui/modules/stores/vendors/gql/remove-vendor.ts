import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveVendorMutation,
  RemoveVendorMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REMOVE_VENDOR: TypedDocumentNode<
  RemoveVendorMutation,
  RemoveVendorMutationVariables
> = gql`
  mutation removeVendor($_id: String!, $physicalStoreId: String!) {
    removeVendor(_id: $_id, physicalStoreId: $physicalStoreId)
  }
`;
