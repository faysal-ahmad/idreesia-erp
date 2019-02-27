import moment from "moment";
import { parse } from "query-string";
import { get } from "lodash";

import { Vouchers } from "meteor/idreesia-common/collections/accounts";
import { Formats } from "meteor/idreesia-common/constants";

export default function getVouchers(companyId, queryString) {
  const params = parse(queryString);
  const pipeline = [
    {
      $match: {
        companyId: { $eq: companyId },
      },
    },
  ];

  const {
    startDate,
    endDate,
    voucherNumber,
    pageIndex = "0",
    pageSize = "10",
  } = params;

  if (voucherNumber) {
    pipeline.push({
      $match: {
        voucherNumber: { $eq: voucherNumber },
      },
    });
  }

  if (startDate) {
    pipeline.push({
      $match: {
        voucherDate: {
          $gte: moment(startDate, Formats.DATE_FORMAT)
            .startOf("day")
            .toDate(),
        },
      },
    });
  }
  if (endDate) {
    pipeline.push({
      $match: {
        voucherDate: {
          $lte: moment(endDate, Formats.DATE_FORMAT)
            .endOf("day")
            .toDate(),
        },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: "total",
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { voucherDate: -1, order: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const vouchers = Vouchers.aggregate(resultsPipeline).toArray();
  const totalResults = Vouchers.aggregate(countingPipeline).toArray();

  return Promise.all([vouchers, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ["0", "total"], 0),
  }));
}
