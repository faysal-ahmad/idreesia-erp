import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingPettyCashFundMutation,
  CreatePurchasingPettyCashFundMutationVariables,
  PagedPurchasingPettyCashFundsQuery,
  PagedPurchasingCustodianKarkunsQuery,
  PagedPurchasingCustodianKarkunsQueryVariables,
  PagedPurchasingPettyCashFundsQueryVariables,
  SetPurchasingPettyCashFundActiveMutation,
  SetPurchasingPettyCashFundActiveMutationVariables,
  UpdatePurchasingPettyCashFundMutation,
  UpdatePurchasingPettyCashFundMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

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

export const PAGED_PURCHASING_CUSTODIAN_KARKUNS: TypedDocumentNode<
  PagedPurchasingCustodianKarkunsQuery,
  PagedPurchasingCustodianKarkunsQueryVariables
> = gql`
  query pagedPurchasingCustodianKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedPurchasingCustodianKarkuns(
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...PickerPersonFields
      }
    }
  }
  ${PICKER_PERSON_FIELDS}
`;

/** The people who may hold a fund: those with a Purchasing permission. */
export const purchasingCustodianKarkunSource: PersonSearchSource<PagedPurchasingCustodianKarkunsQuery> = {
  query: PAGED_PURCHASING_CUSTODIAN_KARKUNS,
  select: data => data.pagedPurchasingCustodianKarkuns,
  description:
    'Showing karkuns who hold at least one Purchasing permission, given directly or through a user group. Locked accounts and super admins are left out.',
};
