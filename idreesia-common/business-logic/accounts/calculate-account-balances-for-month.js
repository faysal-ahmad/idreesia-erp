import { filter, forEach, map } from "lodash";

import {
  AccountMonthlyBalances,
  VoucherDetails
} from "meteor/idreesia-common/collections/accounts";
import { Formats } from "meteor/idreesia-common/constants";

/**
 * This method is used to calculate balances for the non-leaf nodes in the
 * accounts hierarchy. These values are calculated by accumulating the values
 * of the direct child accounts of a particular account.
 */
function accumulateAccountBalancesForNode(
  accountHead,
  allAccountHeads,
  month,
  voucherDetails
) {
  const { companyId } = accountHead;
  // Does this account head has child account heads. If so then recursively calculate values for them.
  const childAccountHeads = filter(allAccountHeads, ah => {
    return ah.parent === accountHead.number;
  });

  if (childAccountHeads.length === 0) {
    // This is a leaf node. Calculate the values for this from the vouchers.
    return calculateAccountBalancesForLeafNode(
      accountHead,
      month.clone(),
      voucherDetails
    );
  }

  // Recursively call calculation method on all child nodes before performing accumulation for this node
  forEach(childAccountHeads, childAccountHead => {
    accumulateAccountBalancesForNode(
      childAccountHead,
      allAccountHeads,
      month.clone(),
      voucherDetails
    );
  });

  // Perform accumulation for the current node
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
    monthString: month.format(Formats.DATE_FORMAT)
  });

  const childAccountHeadIds = map(childAccountHeads, ({ _id }) => _id);
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
}

/**
 * This method is used to calculate balances for the leaf nodes in the accounts
 * hierarchy. These values are calculated from vouchers and voucher details.
 */
function calculateAccountBalancesForLeafNode(
  accountHead,
  month,
  voucherDetails
) {
  const { companyId } = accountHead;

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
    monthString: month.format(Formats.DATE_FORMAT)
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

  voucherDetails.forEach(({ accountHeadId, amount, isCredit }) => {
    if (accountHeadId === accountHead._id) {
      if (isCredit) {
        monthlyBalance.credits += amount;
      } else {
        monthlyBalance.debits += amount;
      }
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
}

/**
 *
 * @param {*} allAccountHeads - List of all account heads
 * @param {*} month - The month for which the calculation needs to be performed
 * @param {*} voucherDetails - All voucher details for the month
 */
export default function calculateAccountBalancesForMonth(
  allAccountHeads,
  month,
  voucherDetails
) {
  // Get all the root nodes and call method to perform calculation on them.
  const rootAccountHeads = filter(
    allAccountHeads,
    accountHead => accountHead.parent === "0"
  );

  forEach(rootAccountHeads, accountHead => {
    accumulateAccountBalancesForNode(
      accountHead,
      allAccountHeads,
      month,
      voucherDetails
    );
  });
}
