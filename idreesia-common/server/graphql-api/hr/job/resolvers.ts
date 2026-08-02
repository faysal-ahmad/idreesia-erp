import { People } from 'meteor/idreesia-common/server/collections/common';
import { Jobs } from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  JobType: {
    usedCount: async jobType =>
      People.find({
        'employeeData.jobId': { $eq: jobType._id },
      }).countAsync(),
  },

  Query: {
    allJobs: async () => Jobs.find({}, { sort: { name: 1 } }).fetchAsync(),
    jobById: async (obj, { id }) => Jobs.findOneAsync(id),
  },

  Mutation: {
    createJob: async (obj, { name, description }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Setup Data in the System.'
        );
      }

      const date = new Date();
      const jobId = await Jobs.insertAsync({
        name,
        description,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Jobs.findOneAsync(jobId);
    },

    updateJob: async (obj, { id, name, description }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Setup Data in the System.'
        );
      }

      const date = new Date();
      await Jobs.updateAsync(id, {
        $set: {
          name,
          description,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Jobs.findOneAsync(id);
    },

    removeJob: async (obj, { _id }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Setup Data in the System.'
        );
      }

      return Jobs.removeAsync(_id);
    },
  },
};

export default resolvers;
