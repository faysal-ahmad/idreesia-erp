import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ApprovePurchasingPettyCashVoucherMutation,
  ApprovePurchasingPettyCashVoucherMutationVariables,
  CreatePurchasingPettyCashVoucherMutation,
  CreatePurchasingPettyCashVoucherMutationVariables,
  DeletePurchasingPettyCashVoucherMutation,
  DeletePurchasingPettyCashVoucherMutationVariables,
  PagedPurchasingPettyCashVouchersQuery,
  PagedPurchasingPettyCashVouchersQueryVariables,
  PurchasingPettyCashVoucherByIdQuery,
  PurchasingPettyCashVoucherByIdQueryVariables,
  ReferenceStockItemsQuery,
  ReferenceStockItemsQueryVariables,
  RejectPurchasingPettyCashVoucherMutation,
  RejectPurchasingPettyCashVoucherMutationVariables,
  SubmitPurchasingPettyCashVoucherMutation,
  SubmitPurchasingPettyCashVoucherMutationVariables,
  UpdatePurchasingPettyCashVoucherMutation,
  UpdatePurchasingPettyCashVoucherMutationVariables,
  VoidPurchasingPettyCashVoucherMutation,
  VoidPurchasingPettyCashVoucherMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PAGED_PURCHASING_PETTY_CASH_VOUCHERS: TypedDocumentNode<
  PagedPurchasingPettyCashVouchersQuery,
  PagedPurchasingPettyCashVouchersQueryVariables
> = gql`
  query pagedPurchasingPettyCashVouchers(
    $search: String
    $status: String
    $fundId: String
    $expenseHeadId: String
    $replenishmentId: String
    $unreplenishedOnly: Boolean
    $pageIndex: Int
    $pageSize: Int
  ) {
    pagedPurchasingPettyCashVouchers(
      search: $search
      status: $status
      fundId: $fundId
      expenseHeadId: $expenseHeadId
      replenishmentId: $replenishmentId
      unreplenishedOnly: $unreplenishedOnly
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        number
        fundId
        fund {
          _id
          name
        }
        expenseHead {
          _id
          name
        }
        voucherDate
        payee
        purpose
        total
        status
        replenishmentId
      }
    }
  }
`;

export const PURCHASING_PETTY_CASH_VOUCHER_BY_ID: TypedDocumentNode<
  PurchasingPettyCashVoucherByIdQuery,
  PurchasingPettyCashVoucherByIdQueryVariables
> = gql`
  query purchasingPettyCashVoucherById($_id: String!) {
    purchasingPettyCashVoucherById(_id: $_id) {
      _id
      number
      fundId
      fund {
        _id
        name
        balance
        perTransactionLimit
      }
      expenseHeadId
      expenseHead {
        _id
        name
      }
      voucherDate
      payee
      vendorId
      vendor {
        _id
        name
      }
      purpose
      lines {
        _id
        description
        unit
        quantity
        unitPrice
        amount
        physicalStoreId
        physicalStoreName
        externalCatalogId
        stockItemName
      }
      total
      status
      version
      submittedAt
      approvedAt
      rejectedAt
      rejectionReason
      voidedAt
      voidReason
      replenishmentId
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export const CREATE_PURCHASING_PETTY_CASH_VOUCHER: TypedDocumentNode<
  CreatePurchasingPettyCashVoucherMutation,
  CreatePurchasingPettyCashVoucherMutationVariables
> = gql`
  mutation createPurchasingPettyCashVoucher(
    $fundId: String!
    $expenseHeadId: String!
    $voucherDate: String!
    $payee: String
    $vendorId: String
    $purpose: String
    $lines: [PurchasingPettyCashVoucherLineInput!]!
  ) {
    createPurchasingPettyCashVoucher(
      fundId: $fundId
      expenseHeadId: $expenseHeadId
      voucherDate: $voucherDate
      payee: $payee
      vendorId: $vendorId
      purpose: $purpose
      lines: $lines
    ) {
      _id
    }
  }
`;

export const UPDATE_PURCHASING_PETTY_CASH_VOUCHER: TypedDocumentNode<
  UpdatePurchasingPettyCashVoucherMutation,
  UpdatePurchasingPettyCashVoucherMutationVariables
> = gql`
  mutation updatePurchasingPettyCashVoucher(
    $_id: String!
    $expenseHeadId: String!
    $voucherDate: String!
    $payee: String
    $vendorId: String
    $purpose: String
    $lines: [PurchasingPettyCashVoucherLineInput!]!
  ) {
    updatePurchasingPettyCashVoucher(
      _id: $_id
      expenseHeadId: $expenseHeadId
      voucherDate: $voucherDate
      payee: $payee
      vendorId: $vendorId
      purpose: $purpose
      lines: $lines
    ) {
      _id
    }
  }
`;

export const SUBMIT_PURCHASING_PETTY_CASH_VOUCHER: TypedDocumentNode<
  SubmitPurchasingPettyCashVoucherMutation,
  SubmitPurchasingPettyCashVoucherMutationVariables
> = gql`
  mutation submitPurchasingPettyCashVoucher($_id: String!) {
    submitPurchasingPettyCashVoucher(_id: $_id) {
      _id
      status
    }
  }
`;

export const DELETE_PURCHASING_PETTY_CASH_VOUCHER: TypedDocumentNode<
  DeletePurchasingPettyCashVoucherMutation,
  DeletePurchasingPettyCashVoucherMutationVariables
> = gql`
  mutation deletePurchasingPettyCashVoucher($_id: String!) {
    deletePurchasingPettyCashVoucher(_id: $_id)
  }
`;

export const APPROVE_PURCHASING_PETTY_CASH_VOUCHER: TypedDocumentNode<
  ApprovePurchasingPettyCashVoucherMutation,
  ApprovePurchasingPettyCashVoucherMutationVariables
> = gql`
  mutation approvePurchasingPettyCashVoucher($_id: String!) {
    approvePurchasingPettyCashVoucher(_id: $_id) {
      _id
      status
    }
  }
`;

export const REJECT_PURCHASING_PETTY_CASH_VOUCHER: TypedDocumentNode<
  RejectPurchasingPettyCashVoucherMutation,
  RejectPurchasingPettyCashVoucherMutationVariables
> = gql`
  mutation rejectPurchasingPettyCashVoucher($_id: String!, $reason: String!) {
    rejectPurchasingPettyCashVoucher(_id: $_id, reason: $reason) {
      _id
      status
    }
  }
`;

export const VOID_PURCHASING_PETTY_CASH_VOUCHER: TypedDocumentNode<
  VoidPurchasingPettyCashVoucherMutation,
  VoidPurchasingPettyCashVoucherMutationVariables
> = gql`
  mutation voidPurchasingPettyCashVoucher($_id: String!, $reason: String!) {
    voidPurchasingPettyCashVoucher(_id: $_id, reason: $reason) {
      _id
      status
    }
  }
`;

export const REFERENCE_STOCK_ITEMS: TypedDocumentNode<
  ReferenceStockItemsQuery,
  ReferenceStockItemsQueryVariables
> = gql`
  query referenceStockItems($physicalStoreId: String!, $name: String) {
    referenceStockItems(physicalStoreId: $physicalStoreId, name: $name) {
      _id
      name
      unitOfMeasurement
    }
  }
`;
