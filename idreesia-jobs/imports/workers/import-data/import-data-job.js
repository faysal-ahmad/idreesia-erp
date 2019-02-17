import * as JOB_TYPES from "imports/constants/job-types";
import {
  Companies,
  DataImports,
} from "meteor/idreesia-common/collections/accounts";

import Jobs from "imports/collections/jobs";

import importData from "./importers/import-data";

export const worker = (job, callback) => {
  // eslint-disable-next-line no-console
  console.log(`--> Importing data`, job.data);

  const { dataImportId } = job.data;

  const dataImport = DataImports.findOne(dataImportId);
  const company = Companies.findOne(dataImport.companyId);

  return importData(dataImport, company)
    .then(() => {
      DataImports.update(dataImportId, {
        $set: {
          status: dataImport.status,
          logs: dataImport.logs,
          errorDetails: dataImport.errorDetails,
        },
      });
    })
    .finally(() => {
      job.done();
      if (callback) {
        callback();
      }
    });
};

export default Jobs.processJobs(
  JOB_TYPES.IMPORT_DATA,
  {
    pollInterval: 500,
    concurrency: 1,
    workTimeout: 10 * 1000,
  },
  worker
);
