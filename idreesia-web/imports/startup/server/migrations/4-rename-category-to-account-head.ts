import { Migrations } from 'meteor/quave:migrations';
// VoucherDetails collection has since been dropped - see migration 42.
// import { VoucherDetails } from 'meteor/idreesia-common/server/collections/accounts';

Migrations.add({
  version: 4,
  async up() {
    // VoucherDetails collection has since been dropped.
    // const vds = await VoucherDetails.find({}).fetchAsync();
    // for (const voucherDetail of vds) {
    //   await VoucherDetails.updateAsync(voucherDetail._id, {
    //     $set: {
    //       accountHeadId: voucherDetail.categoryId,
    //     },
    //     $unset: {
    //       categoryId: '',
    //     },
    //   });
    // }
  },
});
