import moment from 'moment';

import {
  Salaries,
  Karkuns,
  Jobs,
} from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Formats,
  Permissions as PermissionConstants,
} from 'meteor/idreesia-common/constants';
import { createMonthlySalaries } from 'meteor/idreesia-common/server/business-logic/hr/create-monthly-salaries';

export default {
  SalaryType: {
    karkun: salaryType =>
      Karkuns.findOne({
        _id: { $eq: salaryType.karkunId },
      }),
    job: salaryType => {
      if (!salaryType.jobId) return null;
      return Jobs.findOne({
        _id: { $eq: salaryType.jobId },
      });
    },
  },

  Query: {
    salariesByKarkun(obj, { karkunId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_EMPLOYEES,
          PermissionConstants.HR_MANAGE_EMPLOYEES,
        ])
      ) {
        return [];
      }

      return Salaries.find({
        karkunId,
      }).fetch();
    },

    salariesByMonth(obj, { month, jobId }, { user }) {
      if (!jobId) return [];

      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_EMPLOYEES,
          PermissionConstants.HR_MANAGE_EMPLOYEES,
        ])
      ) {
        return [];
      }

      const formattedMonth = moment(month, Formats.DATE_FORMAT)
        .startOf('month')
        .format('MM-YYYY');

      return Salaries.find({
        month: formattedMonth,
        jobId,
      }).fetch();
    },
  },

  Mutation: {
    createSalaries(obj, { month }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_EMPLOYEES])
      ) {
        throw new Error(
          'You do not have permission to manage salaries in the System.'
        );
      }

      const formattedCurrentMonth = moment(month, Formats.DATE_FORMAT)
        .startOf('month')
        .format('MM-YYYY');

      const formattedPreviousMonth = moment(month, Formats.DATE_FORMAT)
        .subtract(1, 'months')
        .startOf('month')
        .format('MM-YYYY');

      return createMonthlySalaries(
        formattedCurrentMonth,
        formattedPreviousMonth,
        user
      );
    },

    updateSalary(
      obj,
      { _id, salary, openingLoan, loanDeduction, newLoan, otherDeduction },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_EMPLOYEES])
      ) {
        throw new Error(
          'You do not have permission to manage salaries in the System.'
        );
      }

      const date = new Date();
      Salaries.update(_id, {
        $set: {
          salary,
          openingLoan,
          loanDeduction,
          otherDeduction,
          newLoan,
          closingLoan: openingLoan + newLoan - loanDeduction,
          netPayment: salary + newLoan - loanDeduction - otherDeduction,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Salaries.findOne(_id);
    },

    deleteSalaries(obj, { ids }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_EMPLOYEES])
      ) {
        throw new Error(
          'You do not have permission to manage salaries in the System.'
        );
      }

      return Salaries.remove({
        _id: { $in: ids },
      });
    },

    deleteAllSalaries(obj, { month }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_EMPLOYEES])
      ) {
        throw new Error(
          'You do not have permission to manage salaries in the System.'
        );
      }

      const formattedMonth = moment(month, Formats.DATE_FORMAT)
        .startOf('month')
        .format('MM-YYYY');

      return Salaries.remove({
        month: formattedMonth,
      });
    },
  },
};
