import { AggregatableCollection } from "meteor/idreesia-common/collections";
import { AmaanatLog as AmaanatLogSchema } from "../../schemas/accounts";

class AmaanatLogs extends AggregatableCollection {
  constructor(name = "accounts-amaanat-logs", options = {}) {
    const amaanatLogs = super(name, options);
    amaanatLogs.attachSchema(AmaanatLogSchema);
    return amaanatLogs;
  }
}

export default new AmaanatLogs();
