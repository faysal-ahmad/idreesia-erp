import { addMonths, format, isBefore, startOfMonth } from 'date-fns';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { Salaries, Jobs } from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Formats,
  Permissions as PermissionConstants,
} from 'meteor/idreesia-common/constants';
import { createMonthlySalaries } from 'meteor/idreesia-common/server/business-logic/hr/create-monthly-salaries';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { getPagedSalariesByKarkun } from './queries';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  SalaryType: {
    karkun: async salaryType =>
      People.findOneAsync({
        _id: { $eq: salaryType.karkunId },
      }),
    job: async salaryType => {
      if (!salaryType.jobId) return null;
      return Jobs.findOneAsync({
        _id: { $eq: salaryType.jobId },
      });
    },
    approver: async salaryType => {
      if (!salaryType.approvedBy) return null;
      return People.findOneAsync({
        _id: { $eq: salaryType.approvedBy },
      });
    },
  },

  Query: {
    salariesByMonth: async (obj, { month, jobId }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.HR_VIEW_EMPLOYEES,
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_DATA,
        ])
      ) {
        return [];
      }

      const formattedMonth = format(
        startOfMonth(parseDate(month, Formats.DATE_FORMAT)),
        'MM-yyyy'
      );

      if (jobId) {
        return Salaries.find({
          month: formattedMonth,
          jobId,
        }).fetchAsync();
      }

      return Salaries.find({
        month: formattedMonth,
      }).fetchAsync();
    },

    salariesByIds: async (obj, { ids }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.HR_VIEW_KARKUNS,
          PermissionConstants.HR_MANAGE_KARKUNS,
          PermissionConstants.HR_DELETE_DATA,
        ])
      ) {
        return [];
      }

      const idsArray = ids.split(',');
      return Salaries.find({
        _id: { $in: idsArray },
      }).fetchAsync();
    },

    pagedSalariesByKarkun: async (obj, { queryString }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.HR_VIEW_EMPLOYEES,
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_DATA,
        ])
      ) {
        return {
          salaries: [],
          totalResults: 0,
        };
      }
      return getPagedSalariesByKarkun(queryString);
    },
  },

  Mutation: {
    createSalaries: async (obj, { month }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage salaries in the System.'
        );
      }

      const currentMonth = startOfMonth(parseDate(month, Formats.DATE_FORMAT));
      const formattedCurrentMonth = format(currentMonth, 'MM-yyyy');

      const formattedPreviousMonth = format(addMonths(currentMonth, -1), 'MM-yyyy');

      return await createMonthlySalaries(
        formattedCurrentMonth,
        formattedPreviousMonth,
        user
      );
    },

    updateSalary: async (
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
    ) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage salaries in the System.'
        );
      }

      const date = new Date();
      await Salaries.updateAsync(_id, {
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

      return Salaries.findOneAsync(_id);
    },

    approveSalaries: async (obj, { month, ids }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_APPROVE_SALARIES])) {
        throw new Error(
          'You do not have permission to approve salaries in the System.'
        );
      }

      const formattedMonth = format(
        startOfMonth(parseDate(month, Formats.DATE_FORMAT)),
        'MM-yyyy'
      );

      const date = new Date();
      return Salaries.updateAsync(
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

    approveAllSalaries: async (obj, { month }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_APPROVE_SALARIES])) {
        throw new Error(
          'You do not have permission to approve salaries in the System.'
        );
      }

      const formattedMonth = format(
        startOfMonth(parseDate(month, Formats.DATE_FORMAT)),
        'MM-yyyy'
      );

      const date = new Date();
      return Salaries.updateAsync(
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

    deleteSalaries: async (obj, { month, ids }, { user }) => {
      const currentMonth = startOfMonth(new Date());
      const passedMonth = parseDate(month, Formats.DATE_FORMAT);

      if (
        isBefore(passedMonth, currentMonth) &&
        !hasOnePermission(user, [PermissionConstants.HR_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to remove salaries for past months in the System.'
        );
      }

      if (
        !hasOnePermission(user, [
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to remove salaries in the System.'
        );
      }

      return Salaries.removeAsync({
        _id: { $in: ids },
      });
    },

    deleteAllSalaries: async (obj, { month }, { user }) => {
      const currentMonth = startOfMonth(new Date());
      const passedMonth = parseDate(month, Formats.DATE_FORMAT);

      if (
        isBefore(passedMonth, currentMonth) &&
        !hasOnePermission(user, [PermissionConstants.HR_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to remove salaries for past months in the System.'
        );
      }

      if (
        !hasOnePermission(user, [
          PermissionConstants.HR_MANAGE_EMPLOYEES,
          PermissionConstants.HR_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to remove salaries in the System.'
        );
      }

      const formattedMonth = format(
        startOfMonth(parseDate(month, Formats.DATE_FORMAT)),
        'MM-yyyy'
      );

      return Salaries.removeAsync({
        month: formattedMonth,
      });
    },
  },
};

export default resolvers;
