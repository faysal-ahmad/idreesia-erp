import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ApprovePurchasingPettyCashReplenishmentMutation,
  ApprovePurchasingPettyCashReplenishmentMutationVariables,
  PagedPurchasingPettyCashReplenishmentsQuery,
  PagedPurchasingPettyCashReplenishmentsQueryVariables,
  PurchasingPettyCashReplenishmentByIdQuery,
  PurchasingPettyCashReplenishmentByIdQueryVariables,
  RejectPurchasingPettyCashReplenishmentMutation,
  RejectPurchasingPettyCashReplenishmentMutationVariables,
  RequestPurchasingPettyCashReplenishmentMutation,
  RequestPurchasingPettyCashReplenishmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PAGED_PURCHASING_PETTY_CASH_REPLENISHMENTS: TypedDocumentNode<
  PagedPurchasingPettyCashReplenishmentsQuery,
  PagedPurchasingPettyCashReplenishmentsQueryVariables
> = gql`
  query pagedPurchasingPettyCashReplenishments($search: String, $status: String, $fundId: String, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingPettyCashReplenishments(search: $search, status: $status, fundId: $fundId, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        number
        fundId
        fund {
          _id
          name
        }
        amount
        countedCash
        variance
        status
        createdAt
      }
    }
  }
`;

export const PURCHASING_PETTY_CASH_REPLENISHMENT_BY_ID: TypedDocumentNode<
  PurchasingPettyCashReplenishmentByIdQuery,
  PurchasingPettyCashReplenishmentByIdQueryVariables
> = gql`
  query purchasingPettyCashReplenishmentById($_id: String!) {
    purchasingPettyCashReplenishmentById(_id: $_id) {
      _id
      number
      fundId
      fund {
        _id
        name
        balance
        floatAmount
      }
      voucherIds
      amount
      countedCash
      variance
      notes
      status
      approvedAt
      rejectedAt
      rejectionReason
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export const REQUEST_PURCHASING_PETTY_CASH_REPLENISHMENT: TypedDocumentNode<
  RequestPurchasingPettyCashReplenishmentMutation,
  RequestPurchasingPettyCashReplenishmentMutationVariables
> = gql`
  mutation requestPurchasingPettyCashReplenishment($fundId: String!, $voucherIds: [String], $countedCash: Float, $notes: String) {
    requestPurchasingPettyCashReplenishment(fundId: $fundId, voucherIds: $voucherIds, countedCash: $countedCash, notes: $notes) {
      _id
    }
  }
`;

export const APPROVE_PURCHASING_PETTY_CASH_REPLENISHMENT: TypedDocumentNode<
  ApprovePurchasingPettyCashReplenishmentMutation,
  ApprovePurchasingPettyCashReplenishmentMutationVariables
> = gql`
  mutation approvePurchasingPettyCashReplenishment($_id: String!) {
    approvePurchasingPettyCashReplenishment(_id: $_id) {
      _id
      status
    }
  }
`;

export const REJECT_PURCHASING_PETTY_CASH_REPLENISHMENT: TypedDocumentNode<
  RejectPurchasingPettyCashReplenishmentMutation,
  RejectPurchasingPettyCashReplenishmentMutationVariables
> = gql`
  mutation rejectPurchasingPettyCashReplenishment($_id: String!, $reason: String!) {
    rejectPurchasingPettyCashReplenishment(_id: $_id, reason: $reason) {
      _id
      status
    }
  }
`;
