import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingPettyCashFundMutation,
  CreatePurchasingPettyCashFundMutationVariables,
  PagedPurchasingPettyCashFundsQuery,
  PurchasingPettyCashCustodianSearchQuery,
  PurchasingPettyCashCustodianSearchQueryVariables,
  PagedPurchasingPettyCashFundsQueryVariables,
  SetPurchasingPettyCashFundActiveMutation,
  SetPurchasingPettyCashFundActiveMutationVariables,
  UpdatePurchasingPettyCashFundMutation,
  UpdatePurchasingPettyCashFundMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PAGED_PURCHASING_PETTY_CASH_FUNDS: TypedDocumentNode<
  PagedPurchasingPettyCashFundsQuery,
  PagedPurchasingPettyCashFundsQueryVariables
> = gql`
  query pagedPurchasingPettyCashFunds($search: String, $isActive: Boolean, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingPettyCashFunds(search: $search, isActive: $isActive, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        name
        custodianPersonId
        custodian {
          _id
          sharedData {
            name
          }
        }
        floatAmount
        perTransactionLimit
        balance
        isActive
        notes
      }
    }
  }
`;

export const CREATE_PURCHASING_PETTY_CASH_FUND: TypedDocumentNode<
  CreatePurchasingPettyCashFundMutation,
  CreatePurchasingPettyCashFundMutationVariables
> = gql`
  mutation createPurchasingPettyCashFund(
    $name: String!
    $custodianPersonId: String!
    $floatAmount: Float!
    $perTransactionLimit: Float
    $notes: String
  ) {
    createPurchasingPettyCashFund(
      name: $name
      custodianPersonId: $custodianPersonId
      floatAmount: $floatAmount
      perTransactionLimit: $perTransactionLimit
      notes: $notes
    ) {
      _id
    }
  }
`;

export const UPDATE_PURCHASING_PETTY_CASH_FUND: TypedDocumentNode<
  UpdatePurchasingPettyCashFundMutation,
  UpdatePurchasingPettyCashFundMutationVariables
> = gql`
  mutation updatePurchasingPettyCashFund(
    $_id: String!
    $name: String!
    $custodianPersonId: String!
    $floatAmount: Float!
    $perTransactionLimit: Float
    $notes: String
  ) {
    updatePurchasingPettyCashFund(
      _id: $_id
      name: $name
      custodianPersonId: $custodianPersonId
      floatAmount: $floatAmount
      perTransactionLimit: $perTransactionLimit
      notes: $notes
    ) {
      _id
    }
  }
`;

export const SET_PURCHASING_PETTY_CASH_FUND_ACTIVE: TypedDocumentNode<
  SetPurchasingPettyCashFundActiveMutation,
  SetPurchasingPettyCashFundActiveMutationVariables
> = gql`
  mutation setPurchasingPettyCashFundActive($_id: String!, $isActive: Boolean!) {
    setPurchasingPettyCashFundActive(_id: $_id, isActive: $isActive) {
      _id
      isActive
    }
  }
`;

export const PURCHASING_PETTY_CASH_CUSTODIAN_SEARCH: TypedDocumentNode<
  PurchasingPettyCashCustodianSearchQuery,
  PurchasingPettyCashCustodianSearchQueryVariables
> = gql`
  query purchasingPettyCashCustodianSearch(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    purchasingPettyCashCustodianSearch(
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        imageUrl
        imageThumbnailUrl
      }
    }
  }
`;
