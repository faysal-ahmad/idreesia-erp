/*
VoucherDetails:-
VoucherDetailId
VoucherID
Amount
DrorCr
AccountNo
*/

import sql from "mssql";
import {
  Vouchers,
  VoucherDetails,
} from "meteor/idreesia-common/collections/accounts";

export default async function importVoucherDetailsData(
  company,
  importedVoucherId,
  categoriesMap,
  adminUser
) {
  const voucher = Vouchers.findOne(importedVoucherId);
  const config = JSON.parse(company.connectivitySettings);

  return new Promise((resolve, reject) => {
    sql.connect(config, err => {
      if (err) reject(err);

      const importedVoucherDetailIds = [];
      const processRows = rowsToProcess => {
        rowsToProcess.forEach(
          ({ VoucherDetailId, Amount, DrorCr, AccountNo }) => {
            const existingVoucherDetail = VoucherDetails.findOne({
              companyId: company._id,
              externalReferenceId: VoucherDetailId,
            });

            const category = categoriesMap[AccountNo];

            if (!existingVoucherDetail) {
              const date = new Date();
              const voucherDetailId = VoucherDetails.insert({
                companyId: company._id,
                externalReferenceId: VoucherDetailId,
                voucherId: voucher._id,
                amount: Amount,
                type: DrorCr,
                categoryId: category._id,
                createdAt: date,
                createdBy: adminUser._id,
                updatedAt: date,
                updatedBy: adminUser._id,
              });

              importedVoucherDetailIds.push(voucherDetailId);
            }
          }
        );
      };

      const ps = new sql.PreparedStatement();
      ps.input("voucherId", sql.String);
      ps.prepare("select * from VoucherDetails where VoucherID = @voucherId")
        .then(() => ps.execute({ voucherId: voucher.externalReferenceId }))
        .then(result => {
          processRows(result.recordsets[0]);
        })
        .then(() => ps.unprepare())
        .then(() => {
          resolve(importedVoucherDetailIds);
        })
        .catch(error => {
          reject(error);
        });
    });

    sql.on("error", error => {
      if (error) reject(error);
    });
  });
}
