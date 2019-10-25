/*
Voucher:-
VoucherID
VoucherNo
VoucherDate
VoucherDescription
VOrder
*/

/* eslint "no-param-reassign": "off" */
import sql from 'mssql';
import moment from 'moment';
import { toInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { Vouchers } from 'meteor/idreesia-common/server/collections/accounts';

function splitVoucherNumber(voucherNo) {
  let voucherType = null;
  let voucherNumber = null;

  if (voucherNo.startsWith('JV')) {
    voucherType = voucherNo.slice(0, 2);
    voucherNumber = voucherNo.slice(3);
  } else if (
    voucherNo.startsWith('BPV') ||
    voucherNo.startsWith('BRV') ||
    voucherNo.startsWith('CPV') ||
    voucherNo.startsWith('CRV')
  ) {
    voucherType = voucherNo.slice(0, 3);
    voucherNumber = voucherNo.slice(4);
  } else {
    return null;
  }

  return {
    voucherType,
    voucherNumber: toInteger(voucherNumber),
  };
}

export default async function importVouchersData(
  companyId,
  importForMonth,
  adminUser
) {
  return new Promise((resolve, reject) => {
    const importedVoucherIds = [];
    const processRows = rowsToProcess => {
      rowsToProcess.forEach(
        ({ VoucherID, VoucherNo, VoucherDate, VoucherDescription, VOrder }) => {
          const existingVoucher = Vouchers.findOne({
            companyId,
            externalReferenceId: VoucherID.toString(),
          });

          if (!existingVoucher) {
            const splitVoucherNo = splitVoucherNumber(VoucherNo);

            if (splitVoucherNo) {
              const date = new Date();
              const voucherId = Vouchers.insert({
                companyId,
                externalReferenceId: VoucherID,
                voucherType: splitVoucherNo.voucherType,
                voucherNumber: splitVoucherNo.voucherNumber,
                voucherDate: VoucherDate,
                description: VoucherDescription,
                order: VOrder,
                createdAt: date,
                createdBy: adminUser._id,
                updatedAt: date,
                updatedBy: adminUser._id,
              });

              importedVoucherIds.push(voucherId);
            }
          }
        }
      );
    };

    const startDate = moment(importForMonth, Formats.DATE_FORMAT)
      .startOf('month')
      .toDate();
    const endDate = moment(importForMonth, Formats.DATE_FORMAT)
      .endOf('month')
      .toDate();

    const ps = new sql.PreparedStatement();
    ps.input('startDate', sql.DateTime);
    ps.input('endDate', sql.DateTime);
    ps.prepare(
      'select * from Voucher where VoucherDate >= @startDate AND VoucherDate <= @endDate'
    )
      .then(() => ps.execute({ startDate, endDate }))
      .then(result => {
        processRows(result.recordsets[0]);
      })
      .then(() => ps.unprepare())
      .then(() => {
        resolve(importedVoucherIds);
      })
      .catch(error => {
        reject(error);
      });
  });
}
