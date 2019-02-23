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

export default async function importVouchersData(company, importForMonth, adminUser) {
  return new Promise((resolve, reject) => {
    const config = JSON.parse(company.connectivitySettings);
    sql.connect(config, err => {
      if (err) reject(err);
      
      let importedVouchers = 0;
      const processRows = rowsToProcess => {
        console.log(`Processing ${rowsToProcess.length} rows.`);
        rowsToProcess.forEach(
          ({ VoucherID, VoucherNo, VoucherDate, VoucherDescription, VOrder }) => {
            const existingVoucher = Vouchers.findOne({
              companyId: company._id,
              externalReferenceId: VoucherID,
            });

            if (!existingVoucher) {
              importedVouchers++;
              const date = new Date();
              Vouchers.insert(
                {
                  companyId: company._id,
                  externalReferenceId: VoucherID,
                  voucherNumber: VoucherNo,
                  voucherDate: VoucherDate,
                  description: VoucherDescription,
                  order: VOrder,
                  createdAt: date,
                  createdBy: adminUser._id,
                  updatedAt: date,
                  updatedBy: adminUser._id,
                },
                error => {
                  if (error) console.log(error);
                }
              );
            }
          }
        );
      };

      const startDate = moment(importForMonth).startOf('month').toDate();
      const endDate = moment(importForMonth).endOf('month').toDate();

      const ps = new sql.PreparedStatement();
      ps.input('startDate', sql.DateTime);
      ps.input('endDate', sql.DateTime);
      ps.prepare('select * from Voucher where VoucherDate >= @startDate AND VoucherDate <= @endDate').then(() =>
        ps.execute({startDate, endDate})
      ).then(result => {
        processRows(result.recordsets[0]);
      }).then(() => ps.unprepare())
      .then(() => {
        resolve(importedVouchers);
      }).catch(error => {
        reject(error);
      });
    });

    sql.on("error", error => {
      if (error) reject(error);
    });
  });
}
