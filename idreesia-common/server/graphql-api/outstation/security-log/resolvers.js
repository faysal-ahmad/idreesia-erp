import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedOutstationSecurityLogs: async (obj, { filter }) => {
      const updatedFilter = filter.dataSource
        ? Object.assign({}, filter, {
            dataSources: [filter.dataSource],
          })
        : Object.assign({}, filter, {
            dataSources: [DataSource.OUTSTATION, DataSource.PORTAL],
          });

      return SecurityLogs.searchSecurityLogs(updatedFilter);
    },
  },
};
