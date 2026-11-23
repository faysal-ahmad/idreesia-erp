import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobilePurchasingApprovePurchasingRequisitionMutation,
  MobilePurchasingApprovePurchasingRequisitionMutationVariables,
  MobilePurchasingCancelRequisitionMutation,
  MobilePurchasingCancelRequisitionMutationVariables,
  MobilePurchasingCreateRequisitionMutation,
  MobilePurchasingCreateRequisitionMutationVariables,
  MobilePurchasingPagedRequisitionsQuery,
  MobilePurchasingPagedRequisitionsQueryVariables,
  MobilePurchasingRejectRequisitionMutation,
  MobilePurchasingRejectRequisitionMutationVariables,
  MobilePurchasingReopenRequisitionMutation,
  MobilePurchasingReopenRequisitionMutationVariables,
  MobilePurchasingRequisitionByIdQuery,
  MobilePurchasingRequisitionByIdQueryVariables,
  MobilePurchasingSubmitRequisitionMutation,
  MobilePurchasingSubmitRequisitionMutationVariables,
  MobilePurchasingUpdateRequisitionMutation,
  MobilePurchasingUpdateRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REQUISITION_FIELDS = gql`
  fragment MobilePurchasingRequisitionFields on PurchasingRequisition {
    _id
    number
    title
    purpose
    neededBy
    estimatedTotal
    status
    version
    rejectionReason
    requestedBy
    requestedByPerson {
      _id
      sharedData {
        name
      }
    }
    lines {
      _id
      catalogItemId
      description
      unit
      quantity
      estimatedUnitPrice
    }
  }
`;

export const MOBILE_PURCHASING_PAGED_REQUISITIONS: TypedDocumentNode<
  MobilePurchasingPagedRequisitionsQuery,
  MobilePurchasingPagedRequisitionsQueryVariables
> = gql`
  query mobilePurchasingPagedRequisitions(
    $search: String
    $status: String
    $requestedBy: String
    $pageIndex: Int
    $pageSize: Int
  ) {
    pagedPurchasingRequisitions(
      search: $search
      status: $status
      requestedBy: $requestedBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        number
        title
        status
        neededBy
        estimatedTotal
        requestedByPerson {
          _id
          sharedData {
            name
          }
        }
      }
    }
  }
`;

export const MOBILE_PURCHASING_REQUISITION_BY_ID: TypedDocumentNode<
  MobilePurchasingRequisitionByIdQuery,
  MobilePurchasingRequisitionByIdQueryVariables
> = gql`
  query mobilePurchasingRequisitionById($_id: String!) {
    purchasingRequisitionById(_id: $_id) {
      ...MobilePurchasingRequisitionFields
    }
  }
  ${REQUISITION_FIELDS}
`;

export const MOBILE_PURCHASING_CREATE_REQUISITION: TypedDocumentNode<
  MobilePurchasingCreateRequisitionMutation,
  MobilePurchasingCreateRequisitionMutationVariables
> = gql`
  mutation mobilePurchasingCreateRequisition(
    $title: String!
    $purpose: String
    $requestedBy: String
    $neededBy: String
    $lines: [PurchasingRequisitionLineInput!]!
  ) {
    createPurchasingRequisition(
      title: $title
      purpose: $purpose
      requestedBy: $requestedBy
      neededBy: $neededBy
      lines: $lines
    ) {
      _id
    }
  }
`;

export const MOBILE_PURCHASING_UPDATE_REQUISITION: TypedDocumentNode<
  MobilePurchasingUpdateRequisitionMutation,
  MobilePurchasingUpdateRequisitionMutationVariables
> = gql`
  mutation mobilePurchasingUpdateRequisition(
    $_id: String!
    $version: Int!
    $title: String!
    $purpose: String
    $requestedBy: String
    $neededBy: String
    $lines: [PurchasingRequisitionLineInput!]!
  ) {
    updatePurchasingRequisition(
      _id: $_id
      version: $version
      title: $title
      purpose: $purpose
      requestedBy: $requestedBy
      neededBy: $neededBy
      lines: $lines
    ) {
      _id
    }
  }
`;

export const MOBILE_PURCHASING_SUBMIT_REQUISITION: TypedDocumentNode<
  MobilePurchasingSubmitRequisitionMutation,
  MobilePurchasingSubmitRequisitionMutationVariables
> = gql`
  mutation mobilePurchasingSubmitRequisition($_id: String!) {
    submitPurchasingRequisition(_id: $_id) {
      _id
      status
    }
  }
`;

export const MOBILE_PURCHASING_REOPEN_REQUISITION: TypedDocumentNode<
  MobilePurchasingReopenRequisitionMutation,
  MobilePurchasingReopenRequisitionMutationVariables
> = gql`
  mutation mobilePurchasingReopenRequisition($_id: String!) {
    reopenPurchasingRequisition(_id: $_id) {
      _id
      status
    }
  }
`;

export const MOBILE_PURCHASING_CANCEL_REQUISITION: TypedDocumentNode<
  MobilePurchasingCancelRequisitionMutation,
  MobilePurchasingCancelRequisitionMutationVariables
> = gql`
  mutation mobilePurchasingCancelRequisition($_id: String!) {
    cancelPurchasingRequisition(_id: $_id) {
      _id
      status
    }
  }
`;

export const MOBILE_PURCHASING_APPROVE_REQUISITION: TypedDocumentNode<
  MobilePurchasingApprovePurchasingRequisitionMutation,
  MobilePurchasingApprovePurchasingRequisitionMutationVariables
> = gql`
  mutation mobilePurchasingApprovePurchasingRequisition($_id: String!) {
    approvePurchasingRequisition(_id: $_id) {
      _id
      status
    }
  }
`;

export const MOBILE_PURCHASING_REJECT_REQUISITION: TypedDocumentNode<
  MobilePurchasingRejectRequisitionMutation,
  MobilePurchasingRejectRequisitionMutationVariables
> = gql`
  mutation mobilePurchasingRejectRequisition($_id: String!, $reason: String!) {
    rejectPurchasingRequisition(_id: $_id, reason: $reason) {
      _id
      status
    }
  }
`;
