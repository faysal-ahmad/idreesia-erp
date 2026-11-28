import gql from 'graphql-tag';

export default gql`
type LeaveTypeType {
  _id: String
  name: String
  annualEntitlementDays: Float
  isPaid: Boolean
  allowCarryForward: Boolean
  maxCarryForwardDays: Float
  isActive: Boolean

  # Requests and adjustments using it; a used type can't be deleted.
  usedCount: Int

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type LeaveRequestType {
  _id: String
  personId: String
  leaveTypeId: String
  fromDate: String
  toDate: String
  halfDay: Boolean
  days: Float
  reason: String
  status: String
  confirmedWithPersonId: String
  confirmedOn: String
  confirmationRemarks: String
  approvedAt: String
  approvedBy: String
  rejectedAt: String
  rejectedBy: String
  rejectionReason: String
  cancelledAt: String
  cancelledBy: String
  version: Int

  # The employee on leave, with their job and whom they report to.
  person: HrEmployeeType
  leaveType: LeaveTypeType
  confirmedWith: PersonType
  # Set when the request takes a paid type past the balance. Never blocks.
  balanceWarning: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedLeaveRequestType {
  totalResults: Int
  data: [LeaveRequestType]
}

type LeaveAdjustmentType {
  _id: String
  personId: String
  leaveTypeId: String
  year: Int
  days: Float
  reason: String

  leaveType: LeaveTypeType

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type LeaveBalanceType {
  leaveTypeId: String
  leaveTypeName: String
  isPaid: Boolean
  year: Int
  entitlement: Float
  carriedForward: Float
  adjustments: Float
  used: Float
  pending: Float
  remaining: Float
}

extend type Query {
  allLeaveTypes: [LeaveTypeType]
    @checkPermissions(permissions: [HR_VIEW_LEAVES, HR_MANAGE_LEAVES, HR_APPROVE_LEAVES, HR_MANAGE_EMPLOYEES_SETUP_DATA])
  leaveTypeById(_id: String!): LeaveTypeType
    @checkPermissions(permissions: [HR_VIEW_LEAVES, HR_MANAGE_LEAVES, HR_APPROVE_LEAVES, HR_MANAGE_EMPLOYEES_SETUP_DATA])

  pagedLeaveRequests(
    personId: String
    leaveTypeId: String
    statuses: [String]
    fromDate: String
    toDate: String
    pageIndex: String
    pageSize: String
  ): PagedLeaveRequestType
    @checkPermissions(permissions: [HR_VIEW_LEAVES, HR_MANAGE_LEAVES, HR_APPROVE_LEAVES])
  leaveRequestById(_id: String!): LeaveRequestType
    @checkPermissions(permissions: [HR_VIEW_LEAVES, HR_MANAGE_LEAVES, HR_APPROVE_LEAVES])

  leaveAdjustmentsByPersonId(personId: String!, year: Int): [LeaveAdjustmentType]
    @checkPermissions(permissions: [HR_VIEW_LEAVES, HR_MANAGE_LEAVES, HR_APPROVE_LEAVES])

  leaveBalances(personId: String!, year: Int!): [LeaveBalanceType]
    @checkPermissions(permissions: [HR_VIEW_LEAVES, HR_MANAGE_LEAVES, HR_APPROVE_LEAVES])

  # Leave days the dates would count for the employee, for the request form.
  leaveDaysCount(personId: String!, fromDate: String!, toDate: String!, halfDay: Boolean): Float
    @checkPermissions(permissions: [HR_MANAGE_LEAVES])

  # Current employees, to enter a leave request for.
  pagedHrLeaveEmployees(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [HR_MANAGE_LEAVES])

  # Karkuns of Multan, to record whom HR checked with about a leave.
  pagedHrLeaveConfirmationKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [HR_MANAGE_LEAVES])
}

extend type Mutation {
  createLeaveType(
    name: String!
    annualEntitlementDays: Float!
    isPaid: Boolean!
    allowCarryForward: Boolean!
    maxCarryForwardDays: Float
    isActive: Boolean!
  ): LeaveTypeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES_SETUP_DATA])
  updateLeaveType(
    _id: String!
    name: String!
    annualEntitlementDays: Float!
    isPaid: Boolean!
    allowCarryForward: Boolean!
    maxCarryForwardDays: Float
    isActive: Boolean!
  ): LeaveTypeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES_SETUP_DATA])
  removeLeaveType(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES_SETUP_DATA])

  createLeaveRequest(
    personId: String!
    leaveTypeId: String!
    fromDate: String!
    toDate: String!
    halfDay: Boolean
    reason: String
  ): LeaveRequestType
    @checkPermissions(permissions: [HR_MANAGE_LEAVES])
  recordLeaveConfirmation(
    _id: String!
    version: Int!
    confirmedWithPersonId: String!
    confirmedOn: String
    confirmationRemarks: String
  ): LeaveRequestType
    @checkPermissions(permissions: [HR_MANAGE_LEAVES])
  cancelLeaveRequest(_id: String!): LeaveRequestType
    @checkPermissions(permissions: [HR_MANAGE_LEAVES])
  approveLeaveRequest(_id: String!): LeaveRequestType
    @checkPermissions(permissions: [HR_APPROVE_LEAVES])
  rejectLeaveRequest(_id: String!, rejectionReason: String): LeaveRequestType
    @checkPermissions(permissions: [HR_APPROVE_LEAVES])

  createLeaveAdjustment(
    personId: String!
    leaveTypeId: String!
    year: Int!
    days: Float!
    reason: String!
  ): LeaveAdjustmentType
    @checkPermissions(permissions: [HR_MANAGE_LEAVES])
  removeLeaveAdjustment(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_LEAVES])
}
`;
