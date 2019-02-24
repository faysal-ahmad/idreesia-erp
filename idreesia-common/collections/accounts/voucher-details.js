import { Mongo } from "meteor/mongo";
import { AggregatableCollection } from "meteor/idreesia-common/collections";
import { VoucherDetail as VoucherDetailSchema } from "../../schemas/accounts";

class VoucherDetails extends AggregatableCollection {
  constructor(name = "accounts-voucher-details", options = {}) {
    const voucherDetails = super(name, options);
    voucherDetails.attachSchema(VoucherDetailSchema);
    return voucherDetails;
  }
}

export default new VoucherDetails();
