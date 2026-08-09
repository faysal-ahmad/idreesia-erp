import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetStockItemImageMutation,
  SetStockItemImageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const SET_STOCK_ITEM_IMAGE: TypedDocumentNode<
  SetStockItemImageMutation,
  SetStockItemImageMutationVariables
> = gql`
  mutation setStockItemImage(
    $_id: String!
    $physicalStoreId: String!
    $imageId: String!
  ) {
    setStockItemImage(
      _id: $_id
      physicalStoreId: $physicalStoreId
      imageId: $imageId
    ) {
      _id
      imageId
    }
  }
`;
