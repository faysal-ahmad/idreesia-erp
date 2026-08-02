import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ItemCategoryByIdQuery,
  ItemCategoryByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const ITEM_CATEGORY_BY_ID: TypedDocumentNode<
  ItemCategoryByIdQuery,
  ItemCategoryByIdQueryVariables
> = gql`
  query itemCategoryById($_id: String!, $physicalStoreId: String!) {
    itemCategoryById(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
