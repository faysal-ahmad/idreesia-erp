import { Mongo } from "meteor/mongo";
import { AggregatableCollection } from "meteor/idreesia-common/collections";

import { DataImport as DataImportSchema } from "../../schemas/accounts";

class DataImports extends AggregatableCollection {
  constructor(name = "accounts-data-imports", options = {}) {
    const dataImports = super(name, options);
    dataImports.attachSchema(DataImportSchema);
    return dataImports;
  }
}

export default new DataImports();
