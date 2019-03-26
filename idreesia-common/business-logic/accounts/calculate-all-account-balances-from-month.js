import moment from "moment";
import { map } from "lodash";

import { Formats } from "meteor/idreesia-common/constants";
import {
  AccountHeads,
  Vouchers
} from "meteor/idreesia-common/collections/accounts";
import calculateAccountBalancesForMonth from "./calculate-account-balances-for-month";

/**
 *
 * @param {string} companyId
 * @param {moment} month
 */
function getVouchersForMonth(companyId, month) {
  return Vouchers.find({
    companyId: { $eq: companyId },
    voucherDate: {
      $gte: month.startOf("month").toDate()
    },
    voucherDate: {
      $lte: month.endOf("month").toDate()
    }
  }).fetch();
}

/**
 *
 * @param {string} companyId
 * @param {moment} startingMonth
 */
export default function calculateAllAccountBalancesFromMonth(
  companyId,
  startingMonth
) {
  const allAccountHeads = AccountHeads.find({ companyId }).fetch();

  const calculationMonth = startingMonth.clone().startOf("month");
  const endMonth = moment()
    .add(1, "months")
    .startOf("month");

  while (calculationMonth.isBefore(endMonth)) {
    const vouchers = getVouchersForMonth(companyId, calculationMonth.clone());
    const voucherIds = map(vouchers, voucher => voucher._id);
    calculateAccountBalancesForMonth(
      allAccountHeads,
      calculationMonth.clone(),
      voucherIds
    );

    calculationMonth.add(1, "months");
  }
}
