import { differenceInCalendarDays, startOfDay, startOfMonth } from 'date-fns';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Salaries } from 'meteor/idreesia-common/server/collections/hr';
import type { ProgressReporter } from 'meteor/idreesia-common/server/business-logic/jobs/report-progress';

export function getMonthlySalaryValues(prevMonthSalary?: Record<string, number> | null) {
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

export async function createMonthlySalaries(
  formattedCurrentMonth: string,
  formattedPreviousMonth: string,
  user: { _id: string },
  reportProgress?: ProgressReporter
) {
  let counter = 0;
  // Get all the people who are employees and have a job assigned to them
  const people = await People.find({
    isEmployee: true,
    'employeeData.jobId': { $exists: true, $ne: null },
    deletedAt: { $exists: false },
  }).fetchAsync();

  const date = new Date();
  let processed = 0;
  for (const { _id, employeeData } of people) {
    processed++;
    await reportProgress?.(processed / people.length);

    const jobId = employeeData?.jobId;
    if (!jobId) {
      continue;
    }

    const employmentEndDate = employeeData?.employmentEndDate;

    // Ensure that this karkun is a current employee
    let isCurrentEmployee = true;
    if (employmentEndDate) {
      const currentMonth = startOfMonth(new Date());
      const employmentEnd = startOfDay(new Date(employmentEndDate));
      const diff = differenceInCalendarDays(currentMonth, employmentEnd);
      if (diff > 0) {
        isCurrentEmployee = false;
      }
    }

    if (isCurrentEmployee) {
      // Create a new salary if one does not exist for this karkun/month/job combination
      const existingCurrentMonthSalary = await Salaries.findOneAsync({
        karkunId: _id,
        jobId,
        month: formattedCurrentMonth,
      });

      if (!existingCurrentMonthSalary) {
        counter++;

        const existingPreviousMonthSalary = await Salaries.findOneAsync({
          karkunId: _id,
          jobId,
          month: formattedPreviousMonth,
        });

        const salaryValues = getMonthlySalaryValues(
          existingPreviousMonthSalary as Record<string, number> | null | undefined
        );
        await Salaries.insertAsync({
          karkunId: _id,
          jobId,
          month: formattedCurrentMonth,
          createdAt: date,
          createdBy: user._id,
          ...salaryValues,
        });
      }
    }
  }

  return counter;
}
