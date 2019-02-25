/* eslint "no-param-reassign": "off" */
import { Accounts } from "meteor/accounts-base";
import sql from "mssql";
import { keyBy } from "lodash";

import { AccountHeads } from "meteor/idreesia-common/collections/accounts";
import importAccountHeadsData from "./import-account-heads-data";
import importVouchersData from "./import-vouchers-data";
import importVoucherDetailsData from "./import-voucher-details-data";

export default async function importData(dataImport, company) {
  try {
    const adminUser = Accounts.findUserByUsername("erp-admin");
    const config = JSON.parse(company.connectivitySettings);
    await sql.connect(config);

    if (dataImport.importType === "account-heads") {
      const importedAccountHeadsCount = await importAccountHeadsData(
        company,
        adminUser
      );
      dataImport.logs.push(
        `Imported ${importedAccountHeadsCount} account heads.`
      );
      dataImport.status = "completed";
    } else if (dataImport.importType === "vouchers") {
      const accountHeads = AccountHeads.find({
        companyId: { $eq: company._id },
      }).fetch();
      const accountHeadsMap = keyBy(accountHeads, "number");
      const importedVoucherIds = await importVouchersData(
        company._id,
        dataImport.importForMonth,
        adminUser
      );
      dataImport.logs.push(`Imported ${importedVoucherIds.length} vouchers.`);

      let voucherDetailsCount = 0;
      const promises = importedVoucherIds.map(importedVoucherId =>
        importVoucherDetailsData(
          company._id,
          importedVoucherId,
          accountHeadsMap,
          adminUser
        ).then(voucherDetailIds => {
          voucherDetailsCount += voucherDetailIds.length;
        })
      );

      await Promise.all(promises);
      dataImport.logs.push(`Imported ${voucherDetailsCount} voucher details.`);
      dataImport.status = "completed";
    }
  } catch (err) {
    dataImport.status = "errored";
    dataImport.errorDetails = err.message;
    console.log(err);
  } finally {
    sql.close();
  }
}
