import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingPettyCashExpenseHeadMutation,
  CreatePurchasingPettyCashExpenseHeadMutationVariables,
  DeletePurchasingPettyCashExpenseHeadMutation,
  DeletePurchasingPettyCashExpenseHeadMutationVariables,
  PagedPurchasingPettyCashExpenseHeadsQuery,
  PagedPurchasingPettyCashExpenseHeadsQueryVariables,
  SetPurchasingPettyCashExpenseHeadActiveMutation,
  SetPurchasingPettyCashExpenseHeadActiveMutationVariables,
  UpdatePurchasingPettyCashExpenseHeadMutation,
  UpdatePurchasingPettyCashExpenseHeadMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PAGED_PURCHASING_PETTY_CASH_EXPENSE_HEADS: TypedDocumentNode<
  PagedPurchasingPettyCashExpenseHeadsQuery,
  PagedPurchasingPettyCashExpenseHeadsQueryVariables
> = gql`
  query pagedPurchasingPettyCashExpenseHeads($search: String, $isActive: Boolean, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingPettyCashExpenseHeads(search: $search, isActive: $isActive, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        name
        description
        isActive
        inUse
      }
    }
  }
`;

export const CREATE_PURCHASING_PETTY_CASH_EXPENSE_HEAD: TypedDocumentNode<
  CreatePurchasingPettyCashExpenseHeadMutation,
  CreatePurchasingPettyCashExpenseHeadMutationVariables
> = gql`
  mutation createPurchasingPettyCashExpenseHead($name: String!, $description: String) {
    createPurchasingPettyCashExpenseHead(name: $name, description: $description) {
      _id
    }
  }
`;

export const UPDATE_PURCHASING_PETTY_CASH_EXPENSE_HEAD: TypedDocumentNode<
  UpdatePurchasingPettyCashExpenseHeadMutation,
  UpdatePurchasingPettyCashExpenseHeadMutationVariables
> = gql`
  mutation updatePurchasingPettyCashExpenseHead($_id: String!, $name: String!, $description: String) {
    updatePurchasingPettyCashExpenseHead(_id: $_id, name: $name, description: $description) {
      _id
    }
  }
`;

export const SET_PURCHASING_PETTY_CASH_EXPENSE_HEAD_ACTIVE: TypedDocumentNode<
  SetPurchasingPettyCashExpenseHeadActiveMutation,
  SetPurchasingPettyCashExpenseHeadActiveMutationVariables
> = gql`
  mutation setPurchasingPettyCashExpenseHeadActive($_id: String!, $isActive: Boolean!) {
    setPurchasingPettyCashExpenseHeadActive(_id: $_id, isActive: $isActive) {
      _id
      isActive
    }
  }
`;

export const DELETE_PURCHASING_PETTY_CASH_EXPENSE_HEAD: TypedDocumentNode<
  DeletePurchasingPettyCashExpenseHeadMutation,
  DeletePurchasingPettyCashExpenseHeadMutationVariables
> = gql`
  mutation deletePurchasingPettyCashExpenseHead($_id: String!) {
    deletePurchasingPettyCashExpenseHead(_id: $_id)
  }
`;
