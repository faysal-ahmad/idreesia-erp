/* eslint "no-param-reassign": "off" */
import { Accounts } from "meteor/accounts-base";
import sql from "mssql";

import importCategoriesData from "./import-categories-data";
import importVouchersData from "./import-vouchers-data";

export default async function importData(dataImport, company) {
  try {
    const adminUser = Accounts.findUserByUsername("erp-admin");

    if (dataImport.importType === "categories") {
      const importedCategoriesCount = await importCategoriesData(
        company,
        adminUser
      );
      dataImport.logs.push(`Imported ${importedCategoriesCount} categories.`);
      dataImport.status = "completed";
    } else if (dataImport.importType === "vouchers") {
      const importedVouchersCount = await importVouchersData(
        company,
        dataImport.importForMonth,
        adminUser
      );
      dataImport.logs.push(`Imported ${importedVouchersCount} vouchers.`);
      dataImport.status = "completed";
    }
  } catch (err) {
    dataImport.status = "errored";
    dataImport.errorDetails = err.message;
  } finally {
    sql.close();
  }
}
