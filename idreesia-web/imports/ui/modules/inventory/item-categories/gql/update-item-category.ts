import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateItemCategoryMutation,
  UpdateItemCategoryMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const UPDATE_ITEM_CATEGORY: TypedDocumentNode<
  UpdateItemCategoryMutation,
  UpdateItemCategoryMutationVariables
> = gql`
  mutation updateItemCategory(
    $_id: String!
    $physicalStoreId: String!
    $name: String!
  ) {
    updateItemCategory(
      _id: $_id
      physicalStoreId: $physicalStoreId
      name: $name
    ) {
      _id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
