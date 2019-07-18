import { Jobs, Karkuns } from "meteor/idreesia-common/collections/hr";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  JobType: {
    usedCount: jobType =>
      Karkuns.find({
        jobId: { $eq: jobType._id },
      }).count(),
  },

  Query: {
    allJobs() {
      return Jobs.find({}, { sort: { name: 1 } }).fetch();
    },
    jobById(obj, { id }) {
      return Jobs.findOne(id);
    },
  },

  Mutation: {
    createJob(obj, { name, description }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Setup Data in the System."
        );
      }

      const date = new Date();
      const jobId = Jobs.insert({
        name,
        description,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Jobs.findOne(jobId);
    },

    updateJob(obj, { id, name, description }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Setup Data in the System."
        );
      }

      const date = new Date();
      Jobs.update(id, {
        $set: {
          name,
          description,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Jobs.findOne(id);
    },

    removeJob(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Setup Data in the System."
        );
      }

      return Jobs.remove(_id);
    },
  },
};
