import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import {
  MehfilTemplateDuties,
  type MehfilTemplateDutyDocument,
} from 'meteor/idreesia-common/server/collections/admin';

export async function getMehfilTemplateDuties(dutyIds: readonly string[]) {
  const duties = await MehfilTemplateDuties.find({
    _id: { $in: [...dutyIds] },
  }).fetchAsync();

  const dutiesMap = keyBy(duties, '_id') as Record<
    string,
    MehfilTemplateDutyDocument
  >;
  return dutyIds.map(id => dutiesMap[id]);
}

export const mehfilTemplateDutiesDataLoader = () =>
  new DataLoader<string, MehfilTemplateDutyDocument | undefined>(
    getMehfilTemplateDuties
  );
