import moment from "moment";

import { Vouchers } from "meteor/idreesia-common/collections/accounts";
import { Formats } from "meteor/idreesia-common/constants";

export default async function getVouchersForMonth(companyId, month) {
  const pipeline = [
    {
      $match: {
        companyId: { $eq: companyId }
      }
    },
    {
      $match: {
        voucherDate: {
          $gte: moment(month, Formats.DATE_FORMAT)
            .startOf("month")
            .toDate()
        }
      }
    },
    {
      $match: {
        voucherDate: {
          $gte: moment(month, Formats.DATE_FORMAT)
            .endOf("month")
            .toDate()
        }
      }
    }
  ];

  return Vouchers.aggregate(pipeline).toArray();
}
