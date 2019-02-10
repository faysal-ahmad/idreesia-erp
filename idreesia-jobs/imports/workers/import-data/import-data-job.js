import * as JOB_TYPES from "imports/constants/job-types";
import { Companies } from "meteor/idreesia-common/collections/accounts";

import Jobs from "imports/collections/jobs";

import importCompanyData from "./importers/import-companies-data";

export const worker = (job, callback) => {
  // eslint-disable-next-line no-console
  console.log(`--> Importing data`);

  const companies = Companies.find({}).fetch();
  const promises = companies.map(company => importCompanyData(company));

  return Promise.all(promises)
    .catch(error => {
      // eslint-disable-next-line no-console
      console.log(error);
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
