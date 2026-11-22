import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetPurchasingCatalogItemActiveMutation,
  SetPurchasingCatalogItemActiveMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_PURCHASING_CATALOG_ITEM_ACTIVE: TypedDocumentNode<
  SetPurchasingCatalogItemActiveMutation,
  SetPurchasingCatalogItemActiveMutationVariables
> = gql`
  mutation setPurchasingCatalogItemActive($_id: String!, $isActive: Boolean!) {
    setPurchasingCatalogItemActive(_id: $_id, isActive: $isActive) {
      _id
      isActive
    }
  }
`;

export default SET_PURCHASING_CATALOG_ITEM_ACTIVE;
