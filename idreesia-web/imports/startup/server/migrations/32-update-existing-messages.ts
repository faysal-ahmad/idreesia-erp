import { Migrations } from 'meteor/quave:migrations';

import { Messages } from 'meteor/idreesia-common/server/collections/communication';

Migrations.add({
  version: 32,
  async up() {
    const messages = await Messages.find({}).fetchAsync();
    for (const message of messages) {
      const { recepientFilters } = message as { recepientFilters?: Record<string, any>[] };
      const recepientFilter = recepientFilters?.[0];
      if (!recepientFilter) {
        continue;
      }
      if (recepientFilter.jobId) {
        recepientFilter.jobIds = [recepientFilter.jobId];
        delete recepientFilter.jobId;
      }

      if (recepientFilter.dutyId) {
        if (recepientFilter.dutyShiftId) {
          recepientFilter.dutyShiftIds = [recepientFilter.dutyShiftId];
          delete recepientFilter.dutyShiftId;
        } else {
          recepientFilter.dutyIds = [recepientFilter.dutyId];
          recepientFilter.dutyShiftIds = [];
          delete recepientFilter.dutyId;
        }
      }

      await Messages.updateAsync(message._id, {
        $set: {
          recepientFilters: [recepientFilter],
        },
      });
    }
  },
});
