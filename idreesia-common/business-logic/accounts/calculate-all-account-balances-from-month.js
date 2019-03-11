import moment from "moment";
import { map } from "lodash";

import { Vouchers } from "meteor/idreesia-common/collections/accounts";
import calculateAccountBalancesForMonth from "./calculate-account-balances-for-month";
import getAllAccounts from "./get-all-accounts";
import getVouchersForMonth from "./get-vouchers-for-month";

async function calculateAllAccountBalancesforMonth(
  companyId,
  numbers,
  calculationMonth
) {
  const vouchers = await getVouchersForMonth(companyId, calculationMonth);
  const voucherIds = map(vouchers, voucher => voucher._id);
  return Promise.all(
    numbers.map(number =>
      calculateAccountBalancesForMonth(
        companyId,
        number,
        calculationMonth,
        voucherIds
      )
    )
  );
}

export default async function calculateAllAccountBalancesFromMonth(
  companyId,
  startingMonth
) {
  const allAccountHeads = await getAllAccounts(companyId);
  const numbers = allAccountHeads.map(({ number }) => number);
  const calculationMonth = startingMonth.clone();
  const endMonth = moment()
    .add(1, "months")
    .startOf("month");

  const promises = [];
  while (calculationMonth.isBefore(endMonth)) {
    promises.push(
      calculateAllAccountBalancesforMonth(
        companyId,
        numbers,
        calculationMonth.clone()
      )
    );

    calculationMonth.add(1, "months");
  }

  return promises;
}
