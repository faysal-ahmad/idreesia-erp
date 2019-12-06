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
    approver: salaryType => {
      if (!salaryType.approvedBy) return null;
      return Karkuns.findOne({
        _id: { $eq: salaryType.approvedBy },
      });
    },
  },

  Query: {
    salariesByKarkun(obj, { karkunId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_EMPLOYEES,
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_EMPLOYEES,
        ])
      ) {
        return [];
      }

      return Salaries.find({
        karkunId,
      }).fetch();
    },

    salariesByMonth(obj, { month, jobId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_EMPLOYEES,
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_EMPLOYEES,
        ])
      ) {
        return [];
      }

      const formattedMonth = moment(month, Formats.DATE_FORMAT)
        .startOf('month')
        .format('MM-YYYY');

      if (jobId) {
        return Salaries.find({
          month: formattedMonth,
          jobId,
        }).fetch();
      }

      return Salaries.find({
        month: formattedMonth,
      }).fetch();
    },

    salariesByIds(obj, { ids }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_VIEW_KARKUNS,
          PermissionConstants.HR_MANAGE_KARKUNS,
          PermissionConstants.HR_DELETE_KARKUNS,
        ])
      ) {
        return [];
      }

      const idsArray = ids.split(',');
      return Salaries.find({
        _id: { $in: idsArray },
      }).fetch();
    },
  },

  Mutation: {
    createSalaries(obj, { month }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_EMPLOYEES,
        ])
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
      {
        _id,
        salary,
        openingLoan,
        loanDeduction,
        newLoan,
        otherDeduction,
        arrears,
        rashanMadad,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_EMPLOYEES,
        ])
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
          arrears,
          rashanMadad,
          closingLoan: openingLoan + newLoan - loanDeduction,
          netPayment: salary + arrears - loanDeduction - otherDeduction,
          updatedAt: date,
          updatedBy: user._id,
        },
        $unset: {
          approvedOn: '',
          approvedBy: '',
        },
      });

      return Salaries.findOne(_id);
    },

    approveSalaries(obj, { month, ids }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_APPROVE_SALARIES])
      ) {
        throw new Error(
          'You do not have permission to approve salaries in the System.'
        );
      }

      const formattedMonth = moment(month, Formats.DATE_FORMAT)
        .startOf('month')
        .format('MM-YYYY');

      const date = new Date();
      return Salaries.update(
        {
          _id: { $in: ids },
          month: formattedMonth,
        },
        {
          $set: {
            approvedOn: date,
            approvedBy: user._id,
          },
        },
        { multi: true }
      );
    },

    approveAllSalaries(obj, { month }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_APPROVE_SALARIES])
      ) {
        throw new Error(
          'You do not have permission to approve salaries in the System.'
        );
      }

      const formattedMonth = moment(month, Formats.DATE_FORMAT)
        .startOf('month')
        .format('MM-YYYY');

      const date = new Date();
      return Salaries.update(
        {
          month: formattedMonth,
        },
        {
          $set: {
            approvedOn: date,
            approvedBy: user._id,
          },
        },
        { multi: true }
      );
    },

    deleteSalaries(obj, { month, ids }, { user }) {
      const currentMonth = moment().startOf('month');
      const passedMonth = moment(month, Formats.DATE_FORMAT);

      if (
        passedMonth.isBefore(currentMonth) &&
        !hasOnePermission(user._id, [PermissionConstants.HR_DELETE_EMPLOYEES])
      ) {
        throw new Error(
          'You do not have permission to remove salaries for past months in the System.'
        );
      }

      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_EMPLOYEES,
        ])
      ) {
        throw new Error(
          'You do not have permission to remove salaries in the System.'
        );
      }

      return Salaries.remove({
        _id: { $in: ids },
      });
    },

    deleteAllSalaries(obj, { month }, { user }) {
      const currentMonth = moment().startOf('month');
      const passedMonth = moment(month, Formats.DATE_FORMAT);

      if (
        passedMonth.isBefore(currentMonth) &&
        !hasOnePermission(user._id, [PermissionConstants.HR_DELETE_EMPLOYEES])
      ) {
        throw new Error(
          'You do not have permission to remove salaries for past months in the System.'
        );
      }

      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_EMPLOYEES,
        ])
      ) {
        throw new Error(
          'You do not have permission to remove salaries in the System.'
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
