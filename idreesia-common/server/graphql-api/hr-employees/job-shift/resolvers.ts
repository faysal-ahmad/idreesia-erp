import {
  countJobShiftEmployees,
  createJobShift,
  removeJobShift,
  updateJobShift,
} from 'meteor/idreesia-common/server/business-logic/hr-employees/job-shifts';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  JobShiftType: {
    usedCount: async jobShift => countJobShiftEmployees(jobShift._id),
  },

  Mutation: {
    createJobShift: async (obj, { jobId, name, startTime, endTime }, { user }) =>
      createJobShift({ jobId, name, startTime, endTime }, user),

    updateJobShift: async (obj, { _id, name, startTime, endTime }, { user }) =>
      updateJobShift(_id, { name, startTime, endTime }, user),

    removeJobShift: async (obj, { _id }, { user }) => removeJobShift(_id, user),
  },
};

export default resolvers;
