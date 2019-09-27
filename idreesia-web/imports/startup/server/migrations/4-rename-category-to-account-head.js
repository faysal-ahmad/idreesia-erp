import { Migrations } from 'meteor/percolate:migrations';
import { VoucherDetails } from 'meteor/idreesia-common/server/collections/accounts';

Migrations.add({
  version: 4,
  up() {
    const vds = VoucherDetails.find({}).fetch();
    vds.forEach(voucherDetail => {
      VoucherDetails.update(voucherDetail._id, {
        $set: {
          accountHeadId: voucherDetail.categoryId,
        },
        $unset: {
          categoryId: '',
        },
      });
    });
  },
});
