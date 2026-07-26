import { Migrations } from 'meteor/percolate:migrations';
import { VoucherDetails } from 'meteor/idreesia-common/server/collections/accounts';

Migrations.add({
  version: 4,
  async up() {
    const vds = await VoucherDetails.find({}).fetchAsync();
    for (const voucherDetail of vds) {
      await VoucherDetails.updateAsync(voucherDetail._id, {
        $set: {
          accountHeadId: voucherDetail.categoryId,
        },
        $unset: {
          categoryId: '',
        },
      });
    }
  },
});
