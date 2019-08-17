import moment from "moment";
import { parse } from "query-string";
import { get } from "lodash";

import { PurchaseForms } from "meteor/idreesia-common/collections/inventory";
import { Formats } from "meteor/idreesia-common/constants";

export function getPurchaseFormsByStockItemId(physicalStoreId, stockItemId) {
  const pipeline = [
    {
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
        items: {
          $elemMatch: {
            stockItemId: { $eq: stockItemId },
          },
        },
      },
    },
    {
      $sort: { returnDate: -1 },
    },
  ];

  return PurchaseForms.aggregate(pipeline).toArray();
}

export default function getPurchaseForms(queryString, physicalStoreId) {
  const params = parse(queryString);
  const pipeline = [
    {
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
      },
    },
  ];

  const {
    showApproved,
    showUnapproved,
    startDate,
    endDate,
    vendorId,
    pageIndex = "0",
    pageSize = "20",
  } = params;

  if (showApproved === "false" && showUnapproved === "false") {
    return {
      issuanceForms: [],
      totalResults: 0,
    };
  } else if (showApproved === "true" && showUnapproved === "false") {
    pipeline.push({
      $match: {
        approvedOn: { $ne: null },
      },
    });
  } else if (showApproved === "false" && showUnapproved === "true") {
    pipeline.push({
      $match: {
        approvedOn: { $eq: null },
      },
    });
  }

  if (startDate) {
    pipeline.push({
      $match: {
        purchaseDate: {
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
        purchaseDate: {
          $lte: moment(endDate, Formats.DATE_FORMAT)
            .endOf("day")
            .toDate(),
        },
      },
    });
  }

  if (vendorId) {
    pipeline.push({
      $match: { vendorId: { $eq: vendorId } },
    });
  }

  pipeline.push({
    $sort: { purchaseDate: -1 },
  });

  const countingPipeline = pipeline.concat({
    $count: "total",
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { issueDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const purchaseForms = PurchaseForms.aggregate(resultsPipeline).toArray();
  const totalResults = PurchaseForms.aggregate(countingPipeline).toArray();

  return Promise.all([purchaseForms, totalResults]).then(results => ({
    purchaseForms: results[0],
    totalResults: get(results[1], ["0", "total"], 0),
  }));
}