import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ItemCategoriesByPhysicalStoreIdQuery,
  ItemCategoriesByPhysicalStoreIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID: TypedDocumentNode<
  ItemCategoriesByPhysicalStoreIdQuery,
  ItemCategoriesByPhysicalStoreIdQueryVariables
> = gql`
  query itemCategoriesByPhysicalStoreId($physicalStoreId: String!) {
    itemCategoriesByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
      _id
      name
      physicalStoreId
      stockItemCount
    }
  }
`;
