import { EntityType } from 'meteor/idreesia-common/constants/audit';
import { searchAuditLogs } from 'meteor/idreesia-common/server/business-logic/common';
import { HR_EMPLOYEE_SELECTOR } from 'meteor/idreesia-common/server/business-logic/hr-common/hr-person-roles';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

// The audit entries of employee management: changes to employees' employee
// data, employment history, job shifts and leaves.
const ENTITY_TYPES = [
  EntityType.EMPLOYEE,
  EntityType.HR_EMPLOYMENT_EVENT,
  EntityType.HR_JOB_SHIFT,
  EntityType.HR_LEAVE_TYPE,
  EntityType.HR_LEAVE_REQUEST,
  EntityType.HR_LEAVE_ADJUSTMENT,
];

const resolvers: ResolverMap = {
  Query: {
    pagedHrEmployeesAuditLogs: async (obj, { filter }) =>
      searchAuditLogs({
        ...filter,
        entityTypes: ENTITY_TYPES,
        // Plus the person entries (shared data changes) of the module's own people.
        personEntitySelector: HR_EMPLOYEE_SELECTOR,
      }),
  },
};

export default resolvers;
