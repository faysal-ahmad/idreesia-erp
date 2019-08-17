import { AdminJobs } from "meteor/idreesia-common/collections/admin";
import { hasOnePermission } from "meteor/idreesia-common/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";
import { createJob } from "meteor/idreesia-common/utilities/jobs";

import getAdminJobs from "./queries";

export default {
  Query: {
    pagedAdminJobs(obj, { jobType, status, pageIndex, pageSize }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_ADMIN_JOBS,
          PermissionConstants.ADMIN_MANAGE_ADMIN_JOBS
        ])
      ) {
        return {
          data: [],
          totalResults: 0
        };
      }

      return getAdminJobs(jobType, status, pageIndex, pageSize);
    }
  },

  Mutation: {
    createAdminJob(obj, { jobType, jobDetails }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_ADMIN_JOBS
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Admin Jobs in the System."
        );
      }

      const date = new Date();
      const adminJobId = AdminJobs.insert({
        jobType,
        jobDetails,
        status: "queued",
        logs: [],
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id
      });

      createJob({
        type: jobType,
        params: { adminJobId },
        options: { priority: "normal", retry: 10 }
      });

      return AdminJobs.findOne(adminJobId);
    },

    removeAdminJob(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_ADMIN_JOBS
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Admin Jobs in the System."
        );
      }

      return AdminJobs.remove(_id);
    }
  }
};
