import {
  AccountHeads,
  Vouchers,
  VoucherDetails,
} from "meteor/idreesia-common/collections/accounts";

const accountHeads = AccountHeads.rawCollection();
accountHeads.createIndex({ number: 1 }, { background: true });
accountHeads.createIndex({ parent: 1 }, { background: true });
accountHeads.createIndex({ companyId: 1 }, { background: true });

const vouchers = Vouchers.rawCollection();
vouchers.createIndex({ companyId: 1 }, { background: true });
vouchers.createIndex({ externalReferenceId: 1 }, { background: true });

const voucherDetails = VoucherDetails.rawCollection();
voucherDetails.createIndex({ companyId: 1 }, { background: true });
voucherDetails.createIndex({ externalReferenceId: 1 }, { background: true });
voucherDetails.createIndex({ accountHeadId: 1 }, { background: true });

const vds = VoucherDetails.find({}).fetch();
vds.forEach(voucherDetail => {
  VoucherDetails.update(voucherDetail._id, {
    $set: {
      accountHeadId: voucherDetail.categoryId,
    },
    $unset: {
      categoryId: "",
    },
  });
});
