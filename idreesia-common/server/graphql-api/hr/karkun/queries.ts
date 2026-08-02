import { get } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';

type PipelineStage = Record<string, unknown>;

interface CountResult {
  total: number;
}

interface RawCollectionWithDistinct {
  distinct(fieldName: string, query?: Record<string, unknown>): Promise<string[]>;
}

export async function getKarkunsByPredefinedFilter(
  params: Record<string, string | undefined>
) {
  const {
    predefinedFilterName,
    predefinedFilterStoreId,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  let karkunIds: string[] = [];
  const purchaseFormsRaw =
    PurchaseForms.rawCollection() as unknown as RawCollectionWithDistinct;
  const issuanceFormsRaw =
    IssuanceForms.rawCollection() as unknown as RawCollectionWithDistinct;
  const stockAdjustmentsRaw =
    StockAdjustments.rawCollection() as unknown as RawCollectionWithDistinct;

  switch (predefinedFilterName) {
    case PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY:
      karkunIds = await purchaseFormsRaw.distinct('receivedBy', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO:
      karkunIds = await purchaseFormsRaw.distinct('purchasedBy', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_BY_RECEIVED_BY:
      karkunIds = await issuanceFormsRaw.distinct('issuedBy', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY:
      karkunIds = await issuanceFormsRaw.distinct('issuedTo', {
        physicalStoreId: predefinedFilterStoreId,
      });
      break;

    case PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY:
      karkunIds = await stockAdjustmentsRaw.distinct('adjustedBy');
      break;

    default:
      karkunIds = [];
      break;
  }

  const pipeline: PipelineStage[] = [
    {
      $match: {
        _id: { $in: karkunIds },
      },
    },
  ];

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(String(pageIndex), 10);
  const nPageSize = parseInt(String(pageSize), 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { 'sharedData.name': 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const people = People.aggregate(resultsPipeline);
  const totalResults = People.aggregate<CountResult>(countingPipeline);

  return Promise.all([people, totalResults]).then(results => {
    const karkuns = results[0].map(person => People.personToKarkun(person));
    return {
      karkuns,
      totalResults: get(results[1], ['0', 'total'], 0),
    };
  });
}
