// @ts-nocheck
import { get } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';

export async function getKarkunsByPredefinedFilter(params) {
  const {
    predefinedFilterName,
    predefinedFilterStoreId,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  let karkunIds = [];

  switch (predefinedFilterName) {
    case PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY:
      karkunIds = await PurchaseForms.rawCollection().distinct('receivedBy', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO:
      karkunIds = await PurchaseForms.rawCollection().distinct('purchasedBy', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_BY_RECEIVED_BY:
      karkunIds = await IssuanceForms.rawCollection().distinct('issuedBy', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY:
      karkunIds = await IssuanceForms.rawCollection().distinct('issuedTo', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY:
      karkunIds = await StockAdjustments.rawCollection().distinct('adjustedBy');
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
    { $sort: { 'sharedData.name': 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const people = People.aggregate(resultsPipeline);
  const totalResults = People.aggregate(countingPipeline);

  return Promise.all([people, totalResults]).then(results => {
    const karkuns = results[0].map(person => People.personToKarkun(person));
    return {
      karkuns,
      totalResults: get(results[1], ['0', 'total'], 0),
    };
  });
}
