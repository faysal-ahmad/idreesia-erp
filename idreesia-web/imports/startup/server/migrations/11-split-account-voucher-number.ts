// @ts-nocheck
import { Migrations } from 'meteor/percolate:migrations';
import { isString, toInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Vouchers } from 'meteor/idreesia-common/server/collections/accounts';

Migrations.add({
  version: 11,
  async up() {
    const vouchers = await Vouchers.find({}).fetchAsync();
    for (const voucher of vouchers) {
      const { voucherNumber } = voucher;

      if (voucherNumber && isString(voucherNumber)) {
        let voucherType;
        let newVoucherNumber;

        if (voucherNumber.startsWith('JV')) {
          voucherType = voucherNumber.slice(0, 2);
          newVoucherNumber = voucherNumber.slice(3);
        } else if (
          voucherNumber.startsWith('BPV') ||
          voucherNumber.startsWith('BRV') ||
          voucherNumber.startsWith('CPV') ||
          voucherNumber.startsWith('CRV')
        ) {
          voucherType = voucherNumber.slice(0, 3);
          newVoucherNumber = voucherNumber.slice(4);
        }

        await Vouchers.updateAsync(voucher._id, {
          $set: {
            voucherType,
            voucherNumber: toInteger(newVoucherNumber),
          },
        });
      }
    }
  },
});
