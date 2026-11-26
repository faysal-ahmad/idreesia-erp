import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { PurchasingPettyCashFunds } from 'meteor/idreesia-common/server/collections/purchasing';

type LoaderRecord = Record<string, unknown>;

export async function getPurchasingPettyCashFunds(fundIds: readonly string[]) {
  const docs = await PurchasingPettyCashFunds.find({
    _id: { $in: fundIds },
  }).fetchAsync();

  const docsMap = keyBy(docs, '_id') as unknown as Record<string, LoaderRecord>;
  return fundIds.map(id => docsMap[id]);
}

export const purchasingPettyCashFundsDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getPurchasingPettyCashFunds);
