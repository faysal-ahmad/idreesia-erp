import * as JOB_TYPES from "imports/constants/job-types";
import Job from "../common/job";

class ImportDataJob extends Job {
  constructor(data = {}) {
    super(JOB_TYPES.IMPORT_DATA, data);
  }
}

export default ImportDataJob;
