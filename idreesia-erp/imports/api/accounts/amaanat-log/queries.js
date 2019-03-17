import moment from "moment";
import { parse } from "query-string";
import { get } from "lodash";

import { AmaanatLogs } from "meteor/idreesia-common/collections/accounts";
import { Formats } from "meteor/idreesia-common/constants";

export default function getAmaanatLogs(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    fromCity,
    hasSadqaPortion,
    hasHadiaPortion,
    hasZakaatPortion,
    hasLangarPortion,
    hasOtherPortion,
    startDate,
    endDate,
    pageIndex = "0",
    pageSize = "10",
  } = params;

  if (fromCity) {
    pipeline.push({
      $match: {
        fromCity: { $eq: fromCity },
      },
    });
  }

  const conditions = [];
  if (hasSadqaPortion === "true") {
    conditions.push({
      $ne: ["sadqaPortion", null],
    });
  }

  if (hasHadiaPortion === "true") {
    conditions.push({
      $ne: ["hadiaPortion", null],
    });
  }

  if (hasZakaatPortion === "true") {
    conditions.push({
      $ne: ["zakaatPortion", null],
    });
  }

  if (hasLangarPortion === "true") {
    conditions.push({
      $ne: ["langarPortion", null],
    });
  }

  if (hasOtherPortion === "true") {
    conditions.push({
      $ne: ["otherPortion", null],
    });
  }

  if (conditions.length > 0) {
    pipeline.push({
      $project: {
        _id: 1,
        fromCity: 1,
        receivedDate: 1,
        totalAmount: 1,
        hadiaPortion: 1,
        sadqaPortion: 1,
        zakaatPortion: 1,
        langarPortion: 1,
        otherPortion: 1,
        otherPortionDescription: 1,
        createdAt: 1,
        createdBy: 1,
        updatedAt: 1,
        updatedBy: 1,
        result: { $or: conditions },
      },
    });
    pipeline.push({
      $match: {
        result: { $eq: true },
      },
    });
  }

  if (startDate) {
    pipeline.push({
      $match: {
        receivedDate: {
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
        receivedDate: {
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
    { $sort: { receivedDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const amaanatLogs = AmaanatLogs.aggregate(resultsPipeline).toArray();
  const totalResults = AmaanatLogs.aggregate(countingPipeline).toArray();

  return Promise.all([amaanatLogs, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ["0", "total"], 0),
  }));
}
