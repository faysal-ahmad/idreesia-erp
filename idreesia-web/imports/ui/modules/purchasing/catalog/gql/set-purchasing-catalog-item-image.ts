import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetPurchasingCatalogItemImageMutation,
  SetPurchasingCatalogItemImageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_PURCHASING_CATALOG_ITEM_IMAGE: TypedDocumentNode<
  SetPurchasingCatalogItemImageMutation,
  SetPurchasingCatalogItemImageMutationVariables
> = gql`
  mutation setPurchasingCatalogItemImage($_id: String!, $imageData: String!) {
    setPurchasingCatalogItemImage(_id: $_id, imageData: $imageData) {
      _id
      imageUrl
    }
  }
`;

export default SET_PURCHASING_CATALOG_ITEM_IMAGE;
