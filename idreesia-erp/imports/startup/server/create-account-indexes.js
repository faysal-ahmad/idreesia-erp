import {
  Categories,
  Vouchers,
  VoucherDetails,
} from "meteor/idreesia-common/collections/accounts";

const categories = Categories.rawCollection();
categories.createIndex({ number: 1 }, { background: true });
categories.createIndex({ parent: 1 }, { background: true });
categories.createIndex({ companyId: 1 }, { background: true });

const vouchers = Vouchers.rawCollection();
vouchers.createIndex({ companyId: 1 }, { background: true });
vouchers.createIndex({ externalReferenceId: 1 }, { background: true });

const voucherDetails = VoucherDetails.rawCollection();
voucherDetails.createIndex({ companyId: 1 }, { background: true });
voucherDetails.createIndex({ externalReferenceId: 1 }, { background: true });
