import moment from "moment";

import calculateAccountBalancesForMonth from "./calculate-account-balances-for-month";

export default async function calculateAccountBalancesFromMonth(
  companyId,
  number,
  startingMonth
) {
  const calculationMonth = startingMonth;
  const endMonth = moment()
    .add(1, "months")
    .startOf("month");

  const promises = [];
  while (calculationMonth.isBefore(endMonth)) {
    promises.push(
      calculateAccountBalancesForMonth(companyId, number, calculationMonth)
    );

    calculationMonth.add(1, "months");
  }

  return promises;
}
