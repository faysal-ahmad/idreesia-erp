import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { PurchasingPettyCashExpenseHeads } from 'meteor/idreesia-common/server/collections/purchasing';

type LoaderRecord = Record<string, unknown>;

export async function getPurchasingPettyCashExpenseHeads(headIds: readonly string[]) {
  const docs = await PurchasingPettyCashExpenseHeads.find({
    _id: { $in: headIds },
  }).fetchAsync();

  const docsMap = keyBy(docs, '_id') as unknown as Record<string, LoaderRecord>;
  return headIds.map(id => docsMap[id]);
}

export const purchasingPettyCashExpenseHeadsDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getPurchasingPettyCashExpenseHeads);
