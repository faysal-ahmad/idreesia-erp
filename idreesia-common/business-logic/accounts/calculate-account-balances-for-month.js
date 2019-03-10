import { map } from "lodash";
import moment from "moment";

import {
  AccountHeads,
  AccountMonthlyBalances,
  VoucherDetails
} from "meteor/idreesia-common/collections/accounts";
import { Formats } from "meteor/idreesia-common/constants";

import getVouchersForMonth from "./get-vouchers-for-month";

/**
 * This methods is used to calculate balances for the non-leaf nodes in the
 * accounts hierarchy. These values are calculated by accumulating the values
 * of the direct child accounts of a particular account.
 */
function accumulateAccountBalancesForMonth(companyId, number, month) {
  const accountHead = AccountHeads.findOne({
    companyId,
    number: number
  });
  const childAccountHeads = AccountHeads.find({
    companyId,
    parent: number
  }).fetch();
  const childAccountHeadIds = map(childAccountHeads, ({ _id }) => _id);

  const prevMonthlyBalance = AccountMonthlyBalances.findOne({
    companyId,
    accountHeadId: accountHead._id,
    monthString: month
      .clone()
      .subtract(1, "months")
      .format(Formats.DATE_FORMAT)
  });

  const currentMonthlyBalance = AccountMonthlyBalances.findOne({
    companyId,
    accountHeadId: accountHead._id,
    monthString: month.clone().format(Formats.DATE_FORMAT)
  });

  const childMonthlyBalances = AccountMonthlyBalances.find({
    companyId,
    accountHeadId: { $in: childAccountHeadIds },
    monthString: month.format(Formats.DATE_FORMAT)
  }).fetch();

  const monthlyBalance = {
    companyId,
    accountHeadId: accountHead._id,
    monthString: month.format(Formats.DATE_FORMAT),
    credits: 0,
    debits: 0,
    prevBalance: prevMonthlyBalance ? prevMonthlyBalance.balance : 0,
    balance: prevMonthlyBalance ? prevMonthlyBalance.balance : 0
  };

  childMonthlyBalances.forEach(childMonthlyBalance => {
    monthlyBalance.credits += childMonthlyBalance.credits;
    monthlyBalance.debits += childMonthlyBalance.debits;
  });

  monthlyBalance.balance += monthlyBalance.credits - monthlyBalance.debits;
  if (currentMonthlyBalance) {
    AccountMonthlyBalances.update(currentMonthlyBalance._id, {
      $set: monthlyBalance
    });
  } else {
    AccountMonthlyBalances.insert(monthlyBalance);
  }

  // Once we have calculated the balance for the node, move up the hierarchy and
  // accumulate the balances for the parent node, if one exists
  if (accountHead.parent !== "0") {
    accumulateAccountBalancesForMonth(companyId, accountHead.parent, month);
  }
}

/**
 * This method is used to calculate balances for the leaf nodes in the accounts
 * hierarchy. These values are calculated from vouchers and voucher details.
 */
export default async function calculateAccountBalancesForMonth(
  companyId,
  number,
  month
) {
  console.log(
    `Calculating for ${companyId}, ${month.format("YYYY-MM")}, ${number}`
  );
  const accountHead = AccountHeads.findOne({
    companyId,
    number: number
  });
  const vouchers = await getVouchersForMonth(companyId, month);
  const voucherIds = map(vouchers, voucher => voucher._id);
  const voucherDetails = VoucherDetails.find({
    _id: { $in: voucherIds }
  }).fetch();

  const prevMonthlyBalance = AccountMonthlyBalances.findOne({
    companyId,
    accountHeadId: accountHead._id,
    monthString: month
      .clone()
      .subtract(1, "months")
      .format(Formats.DATE_FORMAT)
  });

  const currentMonthlyBalance = AccountMonthlyBalances.findOne({
    companyId,
    accountHeadId: accountHead._id,
    monthString: month.clone().format(Formats.DATE_FORMAT)
  });

  const monthlyBalance = {
    companyId,
    accountHeadId: accountHead._id,
    monthString: month.format(Formats.DATE_FORMAT),
    credits: 0,
    debits: 0,
    prevBalance: prevMonthlyBalance ? prevMonthlyBalance.balance : 0,
    balance: prevMonthlyBalance
      ? prevMonthlyBalance.balance
      : accountHead.startingBalance || 0
  };

  voucherDetails.forEach(({ amount, isCredit }) => {
    if (isCredit) {
      monthlyBalance.credits += amount;
    } else {
      monthlyBalance.debits += amount;
    }
  });

  monthlyBalance.balance += monthlyBalance.credits - monthlyBalance.debits;
  if (currentMonthlyBalance) {
    AccountMonthlyBalances.update(currentMonthlyBalance._id, {
      $set: monthlyBalance
    });
  } else {
    AccountMonthlyBalances.insert(monthlyBalance);
  }

  // Once we have calculated the balance for the leaf node, move up the hierarchy and
  // accumulate the balances for the parent nodes
  accumulateAccountBalancesForMonth(companyId, accountHead.parent, month);
}
