import { parse } from 'query-string';
import { get, map } from 'lodash';

import { Karkuns, KarkunDuties } from 'meteor/idreesia-common/collections/hr';
import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/collections/inventory';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';

function getKarkunsByFilter(params) {
  const pipeline = [];

  const {
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    dutyId,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  if (name) {
    if (name.length === 1) {
      pipeline.push({
        $match: { name: { $regex: `^${name}` } },
      });
    } else {
      pipeline.push({
        $match: { $text: { $search: name } },
      });
    }
  }

  if (cnicNumber) {
    pipeline.push({
      $match: {
        cnicNumber: { $eq: cnicNumber },
      },
    });
  }

  if (phoneNumber) {
    pipeline.push({
      $match: {
        $or: [{ contactNumber1: phoneNumber }, { contactNumber2: phoneNumber }],
      },
    });
  }

  if (bloodGroup) {
    pipeline.push({
      $match: {
        bloodGroup: { $eq: bloodGroup },
      },
    });
  }

  if (dutyId) {
    pipeline.push({
      $lookup: {
        from: 'hr-karkun-duties',
        localField: '_id',
        foreignField: 'karkunId',
        as: 'duties',
      },
    });
    pipeline.push({
      $match: {
        duties: {
          $elemMatch: {
            dutyId: { $eq: dutyId },
          },
        },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { firstName: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const karkuns = Karkuns.aggregate(resultsPipeline).toArray();
  const totalResults = Karkuns.aggregate(countingPipeline).toArray();

  return Promise.all([karkuns, totalResults]).then(results => ({
    karkuns: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}

function getKarkunsByPredefinedFilter(params) {
  const { predefinedFilterName, pageIndex = '0', pageSize = '20' } = params;

  let karkunIds = [];
  let distincFunction;

  switch (predefinedFilterName) {
    case PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY:
      distincFunction = Meteor.wrapAsync(
        PurchaseForms.rawCollection().distinct,
        PurchaseForms.rawCollection()
      );
      karkunIds = distincFunction('receivedBy');
      break;

    case PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO:
      distincFunction = Meteor.wrapAsync(
        PurchaseForms.rawCollection().distinct,
        PurchaseForms.rawCollection()
      );
      karkunIds = distincFunction('purchasedBy');
      break;

    case PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_BY_RECEIVED_BY:
      distincFunction = Meteor.wrapAsync(
        IssuanceForms.rawCollection().distinct,
        IssuanceForms.rawCollection()
      );
      karkunIds = distincFunction('issuedBy');
      break;

    case PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY:
      distincFunction = Meteor.wrapAsync(
        IssuanceForms.rawCollection().distinct,
        IssuanceForms.rawCollection()
      );
      karkunIds = distincFunction('issuedTo');
      break;

    case PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY:
      distincFunction = Meteor.wrapAsync(
        StockAdjustments.rawCollection().distinct,
        StockAdjustments.rawCollection()
      );
      karkunIds = distincFunction('adjustedBy');
      break;

    default:
      karkunIds = [];
      break;
  }

  const pipeline = [
    {
      $match: {
        _id: { $in: karkunIds },
      },
    },
  ];

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { firstName: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const karkuns = Karkuns.aggregate(resultsPipeline).toArray();
  const totalResults = Karkuns.aggregate(countingPipeline).toArray();

  return Promise.all([karkuns, totalResults]).then(results => ({
    karkuns: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}

export function getKarkunsByDutyId(dutyId) {
  const pipeline = [
    {
      $match: {
        dutyId: { $eq: dutyId },
      },
    },
    { $group: { _id: '$karkunId' } },
    {
      $lookup: {
        from: 'hr-karkuns',
        localField: '_id',
        foreignField: '_id',
        as: 'karkun',
      },
    },
    { $unwind: '$karkun' },
    { $sort: { 'karkun.firstName': 1 } },
  ];

  return KarkunDuties.aggregate(pipeline)
    .toArray()
    .then(results => map(results, ({ karkun }) => karkun));
}

export function getKarkuns(queryString) {
  const params = parse(queryString);
  const { predefinedFilterName } = params;

  if (predefinedFilterName) {
    return getKarkunsByPredefinedFilter(params);
  }

  return getKarkunsByFilter(params);
}
