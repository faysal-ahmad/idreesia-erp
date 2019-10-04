/* eslint "no-param-reassign": "off" */
import { Accounts } from 'meteor/accounts-base';
import sql from 'mssql';
import { keyBy } from 'lodash';

import {
  Companies,
  AccountHeads,
} from 'meteor/idreesia-common/server/collections/accounts';
import importAccountHeadsData from './import-account-heads-data';
import importVouchersData from './import-vouchers-data';
import importVoucherDetailsData from './import-voucher-details-data';

export default async function importData(adminJob, jobDetails, importType) {
  try {
    const adminUser = Accounts.findUserByUsername('erp-admin');
    const company = Companies.findOne(jobDetails.companyId);

    const config = JSON.parse(company.connectivitySettings);
    await sql.connect(config);

    if (importType === 'account-heads') {
      const importedAccountHeadsCount = await importAccountHeadsData(
        company,
        adminUser
      );
      adminJob.logs.push(
        `Imported ${importedAccountHeadsCount} account heads.`
      );
      adminJob.status = 'completed';
    } else if (importType === 'vouchers') {
      const accountHeads = AccountHeads.find({
        companyId: { $eq: company._id },
      }).fetch();
      const accountHeadsMap = keyBy(accountHeads, 'number');
      const importedVoucherIds = await importVouchersData(
        company._id,
        jobDetails.importForMonth,
        adminUser
      );
      adminJob.logs.push(`Imported ${importedVoucherIds.length} vouchers.`);

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
      adminJob.logs.push(`Imported ${voucherDetailsCount} voucher details.`);
      adminJob.status = 'completed';
    }
  } catch (err) {
    adminJob.status = 'errored';
    adminJob.errorDetails = err.message;
    // eslint-disable-next-line no-console
    console.log(err);
  } finally {
    sql.close();
  }
}
