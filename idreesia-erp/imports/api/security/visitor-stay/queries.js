import { parse } from "query-string";
import moment from "moment";
import { get } from "lodash";

import { Formats } from "meteor/idreesia-common/constants";
import { VisitorStays } from "meteor/idreesia-common/collections/security";

export function getVisitorStays(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    visitorId,
    showApproved,
    showUnapproved,
    startDate,
    endDate,
    pageIndex = "0",
    pageSize = "10",
  } = params;

  if (visitorId) {
    pipeline.push({
      $match: {
        visitorId: { $eq: visitorId },
      },
    });
  }

  if (showApproved === "false" && showUnapproved === "false") {
    return {
      data: [],
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
        fromDate: {
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
        toDate: {
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
    { $sort: { fromDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const visitors = VisitorStays.aggregate(resultsPipeline).toArray();
  const totalResults = VisitorStays.aggregate(countingPipeline).toArray();

  return Promise.all([visitors, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ["0", "total"], 0),
  }));
}
