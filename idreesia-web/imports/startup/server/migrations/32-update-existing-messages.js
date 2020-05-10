import { Migrations } from 'meteor/percolate:migrations';

import { Messages } from 'meteor/idreesia-common/server/collections/communication';

Migrations.add({
  version: 32,
  up() {
    const messages = Messages.find({}).fetch();
    messages.forEach(message => {
      const { recepientFilters } = message;
      const recepientFilter = recepientFilters[0];
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

      Messages.update(message._id, {
        $set: {
          recepientFilters: [recepientFilter],
        },
      });
    });
  },
});
