/*
Voucher:-
VoucherID
VoucherNo
VoucherDate
VoucherDescription
VOrder
*/

/* eslint "no-param-reassign": "off" */
import sql from "mssql";
import moment from "moment";
import { Vouchers } from "meteor/idreesia-common/collections/accounts";

export default async function importVouchersData(
  companyId,
  importForMonth,
  adminUser
) {
  return new Promise((resolve, reject) => {
    const importedVoucherIds = [];
    const processRows = rowsToProcess => {
      rowsToProcess.forEach(
        ({
          VoucherID,
          VoucherNo,
          VoucherDate,
          VoucherDescription,
          VOrder,
        }) => {
          const existingVoucher = Vouchers.findOne({
            companyId,
            externalReferenceId: VoucherID,
          });

          if (!existingVoucher) {
            const date = new Date();
            const voucherId = Vouchers.insert({
              companyId,
              externalReferenceId: VoucherID,
              voucherNumber: VoucherNo,
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
      );
    };

    const startDate = moment(importForMonth)
      .startOf("month")
      .toDate();
    const endDate = moment(importForMonth)
      .endOf("month")
      .toDate();

    const ps = new sql.PreparedStatement();
    ps.input("startDate", sql.DateTime);
    ps.input("endDate", sql.DateTime);
    ps.prepare(
      "select * from Voucher where VoucherDate >= @startDate AND VoucherDate <= @endDate"
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
  })
}
