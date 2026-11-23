import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemovePurchasingCatalogItemImageMutation,
  RemovePurchasingCatalogItemImageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_PURCHASING_CATALOG_ITEM_IMAGE: TypedDocumentNode<
  RemovePurchasingCatalogItemImageMutation,
  RemovePurchasingCatalogItemImageMutationVariables
> = gql`
  mutation removePurchasingCatalogItemImage($_id: String!) {
    removePurchasingCatalogItemImage(_id: $_id) {
      _id
      imageUrl
    }
  }
`;

export default REMOVE_PURCHASING_CATALOG_ITEM_IMAGE;
