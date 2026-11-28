import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllLeaveTypesQuery,
  AllLeaveTypesQueryVariables,
  ApproveLeaveRequestMutation,
  ApproveLeaveRequestMutationVariables,
  CancelLeaveRequestMutation,
  CancelLeaveRequestMutationVariables,
  CreateLeaveAdjustmentMutation,
  CreateLeaveAdjustmentMutationVariables,
  CreateLeaveRequestMutation,
  CreateLeaveRequestMutationVariables,
  CreateLeaveTypeMutation,
  CreateLeaveTypeMutationVariables,
  LeaveAdjustmentsByPersonIdQuery,
  LeaveAdjustmentsByPersonIdQueryVariables,
  LeaveBalancesQuery,
  LeaveBalancesQueryVariables,
  LeaveDaysCountQuery,
  LeaveDaysCountQueryVariables,
  LeaveRequestByIdQuery,
  LeaveRequestByIdQueryVariables,
  PagedHrLeaveConfirmationKarkunsQuery,
  PagedHrLeaveEmployeesQuery,
  PagedLeaveRequestsQuery,
  PagedLeaveRequestsQueryVariables,
  RecordLeaveConfirmationMutation,
  RecordLeaveConfirmationMutationVariables,
  RejectLeaveRequestMutation,
  RejectLeaveRequestMutationVariables,
  RemoveLeaveAdjustmentMutation,
  RemoveLeaveAdjustmentMutationVariables,
  RemoveLeaveTypeMutation,
  RemoveLeaveTypeMutationVariables,
  UpdateLeaveTypeMutation,
  UpdateLeaveTypeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

// ---------------------------------------------------------------------------
// Leave types
// ---------------------------------------------------------------------------

const LEAVE_TYPE_FIELDS = gql`
  fragment LeaveTypeFields on LeaveTypeType {
    _id
    name
    annualEntitlementDays
    isPaid
    allowCarryForward
    maxCarryForwardDays
    isActive
  }
`;

export const ALL_LEAVE_TYPES: TypedDocumentNode<
  AllLeaveTypesQuery,
  AllLeaveTypesQueryVariables
> = gql`
  query allLeaveTypes {
    allLeaveTypes {
      ...LeaveTypeFields
      usedCount
    }
  }
  ${LEAVE_TYPE_FIELDS}
`;

export const CREATE_LEAVE_TYPE: TypedDocumentNode<
  CreateLeaveTypeMutation,
  CreateLeaveTypeMutationVariables
> = gql`
  mutation createLeaveType(
    $name: String!
    $annualEntitlementDays: Float!
    $isPaid: Boolean!
    $allowCarryForward: Boolean!
    $maxCarryForwardDays: Float
    $isActive: Boolean!
  ) {
    createLeaveType(
      name: $name
      annualEntitlementDays: $annualEntitlementDays
      isPaid: $isPaid
      allowCarryForward: $allowCarryForward
      maxCarryForwardDays: $maxCarryForwardDays
      isActive: $isActive
    ) {
      _id
    }
  }
`;

export const UPDATE_LEAVE_TYPE: TypedDocumentNode<
  UpdateLeaveTypeMutation,
  UpdateLeaveTypeMutationVariables
> = gql`
  mutation updateLeaveType(
    $_id: String!
    $name: String!
    $annualEntitlementDays: Float!
    $isPaid: Boolean!
    $allowCarryForward: Boolean!
    $maxCarryForwardDays: Float
    $isActive: Boolean!
  ) {
    updateLeaveType(
      _id: $_id
      name: $name
      annualEntitlementDays: $annualEntitlementDays
      isPaid: $isPaid
      allowCarryForward: $allowCarryForward
      maxCarryForwardDays: $maxCarryForwardDays
      isActive: $isActive
    ) {
      _id
    }
  }
`;

export const REMOVE_LEAVE_TYPE: TypedDocumentNode<
  RemoveLeaveTypeMutation,
  RemoveLeaveTypeMutationVariables
> = gql`
  mutation removeLeaveType($_id: String!) {
    removeLeaveType(_id: $_id)
  }
`;

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

const LEAVE_REQUEST_FIELDS = gql`
  fragment LeaveRequestFields on LeaveRequestType {
    _id
    personId
    leaveTypeId
    fromDate
    toDate
    halfDay
    days
    reason
    status
    confirmedWithPersonId
    confirmedOn
    confirmationRemarks
    approvedAt
    approvedBy
    rejectedAt
    rejectedBy
    rejectionReason
    cancelledAt
    cancelledBy
    version
    balanceWarning
    createdAt
    createdBy
    updatedAt
    updatedBy
    leaveType {
      _id
      name
      isPaid
    }
    confirmedWith {
      _id
      sharedData {
        name
      }
    }
  }
`;

export const PAGED_LEAVE_REQUESTS: TypedDocumentNode<
  PagedLeaveRequestsQuery,
  PagedLeaveRequestsQueryVariables
> = gql`
  query pagedLeaveRequests(
    $personId: String
    $leaveTypeId: String
    $statuses: [String]
    $fromDate: String
    $toDate: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedLeaveRequests(
      personId: $personId
      leaveTypeId: $leaveTypeId
      statuses: $statuses
      fromDate: $fromDate
      toDate: $toDate
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...LeaveRequestFields
        person {
          _id
          sharedData {
            name
            imageUrl
            imageThumbnailUrl
          }
        }
      }
    }
  }
  ${LEAVE_REQUEST_FIELDS}
`;

export const LEAVE_REQUEST_BY_ID: TypedDocumentNode<
  LeaveRequestByIdQuery,
  LeaveRequestByIdQueryVariables
> = gql`
  query leaveRequestById($_id: String!) {
    leaveRequestById(_id: $_id) {
      ...LeaveRequestFields
      person {
        _id
        sharedData {
          name
          imageUrl
        }
        employeeData {
          job {
            _id
            name
          }
          reportsTo {
            _id
            sharedData {
              name
              contactNumber1
              contactNumber2
            }
          }
        }
      }
    }
  }
  ${LEAVE_REQUEST_FIELDS}
`;

export const LEAVE_DAYS_COUNT: TypedDocumentNode<
  LeaveDaysCountQuery,
  LeaveDaysCountQueryVariables
> = gql`
  query leaveDaysCount(
    $personId: String!
    $fromDate: String!
    $toDate: String!
    $halfDay: Boolean
  ) {
    leaveDaysCount(
      personId: $personId
      fromDate: $fromDate
      toDate: $toDate
      halfDay: $halfDay
    )
  }
`;

export const CREATE_LEAVE_REQUEST: TypedDocumentNode<
  CreateLeaveRequestMutation,
  CreateLeaveRequestMutationVariables
> = gql`
  mutation createLeaveRequest(
    $personId: String!
    $leaveTypeId: String!
    $fromDate: String!
    $toDate: String!
    $halfDay: Boolean
    $reason: String
  ) {
    createLeaveRequest(
      personId: $personId
      leaveTypeId: $leaveTypeId
      fromDate: $fromDate
      toDate: $toDate
      halfDay: $halfDay
      reason: $reason
    ) {
      _id
      balanceWarning
    }
  }
`;

export const RECORD_LEAVE_CONFIRMATION: TypedDocumentNode<
  RecordLeaveConfirmationMutation,
  RecordLeaveConfirmationMutationVariables
> = gql`
  mutation recordLeaveConfirmation(
    $_id: String!
    $version: Int!
    $confirmedWithPersonId: String!
    $confirmedOn: String
    $confirmationRemarks: String
  ) {
    recordLeaveConfirmation(
      _id: $_id
      version: $version
      confirmedWithPersonId: $confirmedWithPersonId
      confirmedOn: $confirmedOn
      confirmationRemarks: $confirmationRemarks
    ) {
      _id
    }
  }
`;

export const APPROVE_LEAVE_REQUEST: TypedDocumentNode<
  ApproveLeaveRequestMutation,
  ApproveLeaveRequestMutationVariables
> = gql`
  mutation approveLeaveRequest($_id: String!) {
    approveLeaveRequest(_id: $_id) {
      _id
    }
  }
`;

export const REJECT_LEAVE_REQUEST: TypedDocumentNode<
  RejectLeaveRequestMutation,
  RejectLeaveRequestMutationVariables
> = gql`
  mutation rejectLeaveRequest($_id: String!, $rejectionReason: String) {
    rejectLeaveRequest(_id: $_id, rejectionReason: $rejectionReason) {
      _id
    }
  }
`;

export const CANCEL_LEAVE_REQUEST: TypedDocumentNode<
  CancelLeaveRequestMutation,
  CancelLeaveRequestMutationVariables
> = gql`
  mutation cancelLeaveRequest($_id: String!) {
    cancelLeaveRequest(_id: $_id) {
      _id
    }
  }
`;

// ---------------------------------------------------------------------------
// Balances and adjustments
// ---------------------------------------------------------------------------

export const LEAVE_BALANCES: TypedDocumentNode<
  LeaveBalancesQuery,
  LeaveBalancesQueryVariables
> = gql`
  query leaveBalances($personId: String!, $year: Int!) {
    leaveBalances(personId: $personId, year: $year) {
      leaveTypeId
      leaveTypeName
      isPaid
      year
      entitlement
      carriedForward
      adjustments
      used
      pending
      remaining
    }
  }
`;

export const LEAVE_ADJUSTMENTS_BY_PERSON_ID: TypedDocumentNode<
  LeaveAdjustmentsByPersonIdQuery,
  LeaveAdjustmentsByPersonIdQueryVariables
> = gql`
  query leaveAdjustmentsByPersonId($personId: String!, $year: Int) {
    leaveAdjustmentsByPersonId(personId: $personId, year: $year) {
      _id
      leaveTypeId
      year
      days
      reason
      createdAt
      createdBy
      leaveType {
        _id
        name
      }
    }
  }
`;

export const CREATE_LEAVE_ADJUSTMENT: TypedDocumentNode<
  CreateLeaveAdjustmentMutation,
  CreateLeaveAdjustmentMutationVariables
> = gql`
  mutation createLeaveAdjustment(
    $personId: String!
    $leaveTypeId: String!
    $year: Int!
    $days: Float!
    $reason: String!
  ) {
    createLeaveAdjustment(
      personId: $personId
      leaveTypeId: $leaveTypeId
      year: $year
      days: $days
      reason: $reason
    ) {
      _id
    }
  }
`;

export const REMOVE_LEAVE_ADJUSTMENT: TypedDocumentNode<
  RemoveLeaveAdjustmentMutation,
  RemoveLeaveAdjustmentMutationVariables
> = gql`
  mutation removeLeaveAdjustment($_id: String!) {
    removeLeaveAdjustment(_id: $_id)
  }
`;

// ---------------------------------------------------------------------------
// Person pickers
// ---------------------------------------------------------------------------

const PAGED_HR_LEAVE_EMPLOYEES: TypedDocumentNode<PagedHrLeaveEmployeesQuery> = gql`
  query pagedHrLeaveEmployees(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedHrLeaveEmployees(
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

/** Current employees, to enter a leave request for. */
export const hrLeaveEmployeesSource: PersonSearchSource<PagedHrLeaveEmployeesQuery> = {
  query: PAGED_HR_LEAVE_EMPLOYEES,
  select: data => data.pagedHrLeaveEmployees,
  description: 'Showing current employees.',
};

const PAGED_HR_LEAVE_CONFIRMATION_KARKUNS: TypedDocumentNode<PagedHrLeaveConfirmationKarkunsQuery> = gql`
  query pagedHrLeaveConfirmationKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedHrLeaveConfirmationKarkuns(
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

/** Karkuns of Multan, to record whom HR checked with. */
export const hrLeaveConfirmationSource: PersonSearchSource<PagedHrLeaveConfirmationKarkunsQuery> = {
  query: PAGED_HR_LEAVE_CONFIRMATION_KARKUNS,
  select: data => data.pagedHrLeaveConfirmationKarkuns,
  description: 'Showing karkuns of Multan.',
};

/** Queries to refetch after a request changes. */
export const LEAVE_REFETCH_QUERIES = [
  'pagedLeaveRequests',
  'leaveRequestById',
  'leaveBalances',
];
