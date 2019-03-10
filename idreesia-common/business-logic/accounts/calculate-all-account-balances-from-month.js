import moment from "moment";

import { AccountHeads } from "meteor/idreesia-common/collections/accounts";
import calculateAccountBalancesForMonth from "./calculate-account-balances-for-month";

async function calculateAllAccountBalancesforMonth(
  companyId,
  numbers,
  calculationMonth
) {
  return Promise.all(
    numbers.map(number =>
      calculateAccountBalancesForMonth(companyId, number, calculationMonth)
    )
  );
}

export default async function calculateAllAccountBalancesFromMonth(
  companyId,
  startingMonth
) {
  const allAccountHeads = AccountHeads.find({ companyId }).fetch();
  const numbers = allAccountHeads.map(({ number }) => number);
  const calculationMonth = startingMonth.clone();
  const endMonth = moment()
    .add(1, "months")
    .startOf("month");

  const promises = [];
  while (calculationMonth.isBefore(endMonth)) {
    promises.push(
      calculateAllAccountBalancesforMonth(companyId, numbers, calculationMonth)
    );

    calculationMonth.add(1, "months");
  }

  return promises;
}
