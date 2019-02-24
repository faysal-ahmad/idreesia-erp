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
  companyId,
  importedVoucherId,
  categoriesMap,
  adminUser
) {
  const voucher = Vouchers.findOne(importedVoucherId);
  return new Promise((resolve, reject) => {
    const importedVoucherDetailIds = [];
    const processRows = rowsToProcess => {
      rowsToProcess.forEach(
        ({ VoucherDetailId, Amount, DrorCr, AccountNo }) => {
          const existingVoucherDetail = VoucherDetails.findOne({
            companyId,
            externalReferenceId: VoucherDetailId,
          });

          const category = categoriesMap[AccountNo];
          if (!existingVoucherDetail) {
            const date = new Date();
            const voucherDetailId = VoucherDetails.insert({
              companyId,
              externalReferenceId: VoucherDetailId,
              voucherId: voucher._id,
              amount: Amount,
              isCredit: DrorCr === "Cr",
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
    ps.input("voucherId", sql.Numeric(18, 0));
    ps.prepare("select * from VoucherDetails where VoucherID = @voucherId")
      .then(() => ps.execute({ voucherId: Number(voucher.externalReferenceId) }))
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
  }

