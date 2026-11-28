import { JobShifts, Jobs } from 'meteor/idreesia-common/server/collections/hr';
import {
  countJobEmployees,
  createJob,
  removeJob,
  updateJob,
} from 'meteor/idreesia-common/server/business-logic/hr-employees/jobs';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  JobType: {
    usedCount: async jobType => countJobEmployees(jobType._id),
    shifts: async jobType =>
      JobShifts.find(
        { jobId: jobType._id },
        { sort: { startTime: 1, name: 1 } }
      ).fetchAsync(),
  },

  Query: {
    allJobs: async () => Jobs.find({}, { sort: { name: 1 } }).fetchAsync(),
    jobById: async (obj, { id }) => Jobs.findOneAsync(id),
  },

  Mutation: {
    createJob: async (obj, { name, description }, { user }) =>
      createJob({ name, description }, user),

    updateJob: async (obj, { id, name, description }, { user }) =>
      updateJob(id, { name, description }, user),

    removeJob: async (obj, { _id }) => removeJob(_id),
  },
};

export default resolvers;
