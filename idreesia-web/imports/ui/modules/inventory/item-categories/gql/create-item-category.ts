import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateItemCategoryMutation,
  CreateItemCategoryMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const CREATE_ITEM_CATEGORY: TypedDocumentNode<
  CreateItemCategoryMutation,
  CreateItemCategoryMutationVariables
> = gql`
  mutation createItemCategory($name: String!, $physicalStoreId: String!) {
    createItemCategory(name: $name, physicalStoreId: $physicalStoreId) {
      _id
      name
      physicalStoreId
    }
  }
`;
