import {
  LeaveAdjustments,
  LeaveRequests,
  LeaveTypes,
} from 'meteor/idreesia-common/server/collections/hr';
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  countPersonLeaveDays,
  countLeaveTypeUses,
  createLeaveAdjustment,
  createLeaveRequest,
  createLeaveType,
  getLeaveBalances,
  getLeaveRequestBalanceWarning,
  recordLeaveConfirmation,
  rejectLeaveRequest,
  removeLeaveAdjustment,
  removeLeaveType,
  searchLeaveRequests,
  updateLeaveType,
} from 'meteor/idreesia-common/server/business-logic/hr-employees/leaves';
import {
  searchHrCurrentEmployees,
  searchHrPickerKarkuns,
} from 'meteor/idreesia-common/server/business-logic/hr-common/picker-karkuns';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const loadPerson = (personId: string | undefined, loaders: any) =>
  personId ? loaders.common.people.load(personId) : null;

const resolvers: ResolverMap = {
  LeaveTypeType: {
    usedCount: async leaveType => countLeaveTypeUses(leaveType._id),
  },

  LeaveRequestType: {
    person: async (request, args, { loaders }) =>
      loadPerson(request.personId, loaders),
    confirmedWith: async (request, args, { loaders }) =>
      loadPerson(request.confirmedWithPersonId, loaders),
    leaveType: async request => LeaveTypes.findOneAsync(request.leaveTypeId),
    balanceWarning: async request => getLeaveRequestBalanceWarning(request),
  },

  LeaveAdjustmentType: {
    leaveType: async adjustment =>
      LeaveTypes.findOneAsync(adjustment.leaveTypeId),
  },

  Query: {
    allLeaveTypes: async () =>
      LeaveTypes.find({}, { sort: { name: 1 } }).fetchAsync(),
    leaveTypeById: async (obj, { _id }) => LeaveTypes.findOneAsync(_id),

    pagedLeaveRequests: async (obj, filter) => searchLeaveRequests(filter),
    leaveRequestById: async (obj, { _id }) => LeaveRequests.findOneAsync(_id),

    leaveAdjustmentsByPersonId: async (obj, { personId, year }) =>
      LeaveAdjustments.find(
        year ? { personId, year } : { personId },
        { sort: { year: -1, createdAt: -1 } }
      ).fetchAsync(),

    leaveBalances: async (obj, { personId, year }) =>
      getLeaveBalances(personId, year),

    leaveDaysCount: async (obj, { personId, fromDate, toDate, halfDay }) =>
      countPersonLeaveDays(personId, fromDate, toDate, !!halfDay),

    pagedHrLeaveEmployees: async (obj, args) => searchHrCurrentEmployees(args),

    pagedHrLeaveConfirmationKarkuns: async (obj, args) =>
      searchHrPickerKarkuns(args),
  },

  Mutation: {
    createLeaveType: async (obj, values, { user }) =>
      createLeaveType(values, user),
    updateLeaveType: async (obj, { _id, ...values }, { user }) =>
      updateLeaveType(_id, values, user),
    removeLeaveType: async (obj, { _id }, { user }) =>
      removeLeaveType(_id, user),

    createLeaveRequest: async (obj, values, { user }) =>
      createLeaveRequest(values, user),
    recordLeaveConfirmation: async (obj, { _id, version, ...values }, { user }) =>
      recordLeaveConfirmation(_id, version, values, user),
    cancelLeaveRequest: async (obj, { _id }, { user }) =>
      cancelLeaveRequest(_id, user),
    approveLeaveRequest: async (obj, { _id }, { user }) =>
      approveLeaveRequest(_id, user),
    rejectLeaveRequest: async (obj, { _id, rejectionReason }, { user }) =>
      rejectLeaveRequest(_id, rejectionReason, user),

    createLeaveAdjustment: async (obj, values, { user }) =>
      createLeaveAdjustment(values, user),
    removeLeaveAdjustment: async (obj, { _id }, { user }) =>
      removeLeaveAdjustment(_id, user),
  },
};

export default resolvers;
