import moment from 'moment';

import {
  Salaries,
  Karkuns,
} from 'meteor/idreesia-common/server/collections/hr';

export function getMonthlySalaryValues(prevMonthSalary) {
  if (!prevMonthSalary) {
    return {
      salary: 0,
      openingLoan: 0,
      loanDeduction: 0,
      newLoan: 0,
      closingLoan: 0,
      otherDeduction: 0,
      netPayment: 0,
      arrears: 0,
      rashanMadad: 0,
    };
  }

  const salary = prevMonthSalary.salary;
  const openingLoan = prevMonthSalary.closingLoan;
  const loanDeduction = Math.min(
    prevMonthSalary.loanDeduction,
    prevMonthSalary.closingLoan
  );
  const closingLoan = openingLoan - loanDeduction;
  const netPayment = salary - loanDeduction;
  const rashanMadad = prevMonthSalary.rashanMadad;

  return {
    salary,
    openingLoan,
    loanDeduction,
    newLoan: 0,
    closingLoan,
    otherDeduction: 0,
    arrears: 0,
    netPayment,
    rashanMadad,
  };
}

export function createMonthlySalaries(
  formattedCurrentMonth,
  formattedPreviousMonth,
  user
) {
  let counter = 0;
  // Get all the karkuns who are employees and have a job assigned to them
  const karkuns = Karkuns.find({
    isEmployee: true,
    jobId: { $exists: true, $ne: null },
  }).fetch();

  const date = new Date();
  karkuns.forEach(({ _id, jobId, employmentEndDate }) => {
    // Ensure that this karkun is a current employee
    let isCurrentEmployee = true;
    if (employmentEndDate) {
      const currentMonth = moment().startOf('month');
      const employmentEnd = moment(employmentEndDate).startOf('day');
      const diff = currentMonth.diff(employmentEnd, 'days');
      if (diff > 0) {
        isCurrentEmployee = false;
      }
    }

    if (isCurrentEmployee) {
      // Create a new salary if one does not exist for this karkun/month/job combination
      const existingCurrentMonthSalary = Salaries.findOne({
        karkunId: _id,
        jobId,
        month: formattedCurrentMonth,
      });

      if (!existingCurrentMonthSalary) {
        counter++;

        const existingPreviousMonthSalary = Salaries.findOne({
          karkunId: _id,
          jobId,
          month: formattedPreviousMonth,
        });

        const salaryValues = getMonthlySalaryValues(
          existingPreviousMonthSalary
        );
        Salaries.insert({
          karkunId: _id,
          jobId,
          month: formattedCurrentMonth,
          createdAt: date,
          createdBy: user._id,
          ...salaryValues,
        });
      }
    }
  });

  return counter;
}
