import { AggregatableCollection } from "meteor/idreesia-common/collections";
import { Voucher as VoucherSchema } from "../../schemas/accounts";

class Vouchers extends AggregatableCollection {
  constructor(name = "accounts-vouchers", options = {}) {
    const vouchers = super(name, options);
    vouchers.attachSchema(VoucherSchema);
    return vouchers;
  }
}

export default new Vouchers();
