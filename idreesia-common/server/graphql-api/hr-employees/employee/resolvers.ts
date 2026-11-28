import { People } from 'meteor/idreesia-common/server/collections/common';
import { setEmployeeInfo } from 'meteor/idreesia-common/server/business-logic/hr-employees/employee-info';
import {
  HR_EMPLOYEE_SELECTOR,
  addHrPersonAttachment,
  removeHrPersonAttachment,
  searchHrEmployees,
  setHrPersonImage,
  updateHrPerson,
} from 'meteor/idreesia-common/server/business-logic/hr-common/hr-people';
import { searchHrEmployeeCandidateKarkuns } from 'meteor/idreesia-common/server/business-logic/hr-common/picker-karkuns';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

interface Person {
  _id: string;
  karkunData?: Record<string, unknown> | null;
}

const resolvers: ResolverMap = {
  HrEmployeeType: {
    // Same as PersonType.karkunData: the nested resolvers need the person id.
    karkunData: (person: Person) =>
      person.karkunData ? { ...person.karkunData, _id: person._id } : null,
  },

  Query: {
    hrEmployeeById: async (obj, { _id }) =>
      People.findOneAsync({ _id: { $eq: _id }, ...HR_EMPLOYEE_SELECTOR }),

    hrEmployeesById: async (obj, { _ids }) =>
      People.find({
        _id: { $in: _ids.split(',') },
        ...HR_EMPLOYEE_SELECTOR,
      }).fetchAsync(),

    pagedHrEmployees: async (obj, { filter }) => searchHrEmployees(filter ?? {}),

    pagedHrEmployeeCandidateKarkuns: async (obj, args) =>
      searchHrEmployeeCandidateKarkuns(args),
  },

  Mutation: {
    updateHrEmployee: async (obj, values, { user }) =>
      updateHrPerson('employee', values, user),

    // setEmployeeInfo refuses anyone who isn't an employee.
    setHrEmployeeEmploymentInfo: async (obj, values, { user }) =>
      setEmployeeInfo(values, user),

    setHrEmployeeProfileImage: async (obj, { _id, imageData }, { user }) =>
      setHrPersonImage('employee', _id, imageData, user),

    addHrEmployeeAttachment: async (obj, { _id, attachmentId }, { user }) =>
      addHrPersonAttachment('employee', { _id, attachmentId }, user),

    removeHrEmployeeAttachment: async (obj, { _id, attachmentId }, { user }) =>
      removeHrPersonAttachment('employee', { _id, attachmentId }, user),
  },
};

export default resolvers;
