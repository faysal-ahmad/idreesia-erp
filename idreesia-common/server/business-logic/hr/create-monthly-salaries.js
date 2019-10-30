import {
  Salaries,
  Karkuns,
} from 'meteor/idreesia-common/server/collections/hr';

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
  karkuns.forEach(({ _id, jobId }) => {
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

      if (!existingPreviousMonthSalary) {
        Salaries.insert({
          karkunId: _id,
          jobId,
          month: formattedCurrentMonth,
          salary: 0,
          openingLoan: 0,
          loanDeduction: 0,
          newLoan: 0,
          closingLoan: 0,
          otherDeduction: 0,
          netPayment: 0,
          arrears: 0,
          createdAt: date,
          createdBy: user._id,
        });
      } else {
        const salary = existingPreviousMonthSalary.salary;
        const openingLoan = existingPreviousMonthSalary.closingLoan;
        const loanDeduction = Math.min(
          existingPreviousMonthSalary.loanDeduction,
          existingPreviousMonthSalary.closingLoan
        );
        const closingLoan = openingLoan - loanDeduction;
        const netPayment = salary - loanDeduction;

        Salaries.insert({
          karkunId: _id,
          jobId,
          month: formattedCurrentMonth,
          salary,
          openingLoan,
          loanDeduction,
          newLoan: 0,
          closingLoan,
          otherDeduction: 0,
          arrears: 0,
          netPayment,
          createdAt: date,
          createdBy: user._id,
        });
      }
    }
  });

  return counter;
}
