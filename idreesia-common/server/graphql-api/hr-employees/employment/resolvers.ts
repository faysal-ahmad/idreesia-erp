import { EmploymentEvents } from 'meteor/idreesia-common/server/collections/hr';
import {
  getHrEmploymentSettings,
  updateHrEmploymentSettings,
} from 'meteor/idreesia-common/server/business-logic/admin/system-settings';
import {
  changeEmployeeJob,
  confirmEmployee,
  exitEmployee,
  hireEmployee,
  rejoinEmployee,
} from 'meteor/idreesia-common/server/business-logic/hr-employees/employment-lifecycle';
import { searchHrPickerKarkuns } from 'meteor/idreesia-common/server/business-logic/hr-common/picker-karkuns';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    employmentEventsByPersonId: async (obj, { personId }) =>
      EmploymentEvents.find(
        { personId },
        { sort: { effectiveDate: -1, createdAt: -1 } }
      ).fetchAsync(),

    pagedHrReportsToKarkuns: async (obj, args) => searchHrPickerKarkuns(args),

    hrEmploymentSettings: async () => getHrEmploymentSettings(),
  },

  Mutation: {
    hireEmployee: async (obj, values, { user }) => hireEmployee(values, user),
    rejoinEmployee: async (obj, values, { user }) =>
      rejoinEmployee(values, user),
    confirmEmployee: async (obj, values, { user }) =>
      confirmEmployee(values, user),
    changeEmployeeJob: async (obj, values, { user }) =>
      changeEmployeeJob(values, user),
    exitEmployee: async (obj, values, { user }) => exitEmployee(values, user),
    updateHrEmploymentSettings: async (obj, values, { user }) =>
      updateHrEmploymentSettings(values, user),
  },
};

export default resolvers;
