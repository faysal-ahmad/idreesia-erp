import { addMonths, format, startOfMonth } from 'date-fns';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { Salaries, Jobs } from 'meteor/idreesia-common/server/collections/hr';
import { Formats } from 'meteor/idreesia-common/constants';
import { createMonthlySalaries } from 'meteor/idreesia-common/server/business-logic/hr-employees/create-monthly-salaries';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { getPagedSalariesByKarkun } from 'meteor/idreesia-common/server/business-logic/hr-employees/salary-search';

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
    salariesByMonth: async (obj, { month, jobId }) => {
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

    salariesByIds: async (obj, { ids }) => {
      const idsArray = ids.split(',');
      return Salaries.find({
        _id: { $in: idsArray },
      }).fetchAsync();
    },

    pagedSalariesByKarkun: async (obj, { queryString }) =>
      getPagedSalariesByKarkun(queryString),
  },

  Mutation: {
    createSalaries: async (obj, { month }, { user }) => {
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

    deleteSalaries: async (obj, { month, ids }) => {
      return Salaries.removeAsync({
        _id: { $in: ids },
      });
    },

    deleteAllSalaries: async (obj, { month }) => {
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
