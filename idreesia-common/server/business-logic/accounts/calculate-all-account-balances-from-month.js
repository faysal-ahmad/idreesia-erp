import moment from 'moment';
import { map } from 'lodash';

import {
  AccountHeads,
  Vouchers,
  VoucherDetails,
} from 'meteor/idreesia-common/server/collections/accounts';
import calculateAccountBalancesForMonth from './calculate-account-balances-for-month';

/**
 *
 * @param {string} companyId
 * @param {moment} month
 */
function getVouchersForMonth(companyId, month) {
  const startDate = month
    .clone()
    .startOf('month')
    .toDate();
  const endDate = month
    .clone()
    .endOf('month')
    .toDate();

  const query = {
    companyId: { $eq: companyId },
    voucherDate: {
      $lte: endDate,
      $gte: startDate,
    },
  };

  const vouchers = Vouchers.find(query).fetch();
  return vouchers;
}

function getVoucherDetailsForMonth(companyId, month) {
  const vouchers = getVouchersForMonth(companyId, month);
  const voucherIds = map(vouchers, voucher => voucher._id);
  const voucherDetails = VoucherDetails.find({
    voucherId: { $in: voucherIds },
  }).fetch();

  return voucherDetails;
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

  const calculationMonth = startingMonth.clone().startOf('month');
  const endMonth = moment()
    .add(1, 'months')
    .startOf('month');

  while (calculationMonth.isBefore(endMonth)) {
    const voucherDetails = getVoucherDetailsForMonth(
      companyId,
      calculationMonth
    );
    calculateAccountBalancesForMonth(
      allAccountHeads,
      calculationMonth.clone(),
      voucherDetails
    );

    calculationMonth.add(1, 'months');
  }
}
