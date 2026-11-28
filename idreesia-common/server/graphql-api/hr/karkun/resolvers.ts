import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Committees,
  OrgLocations,
} from 'meteor/idreesia-common/server/collections/admin';
import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { DataSource } from 'meteor/idreesia-common/constants';
import {
  addPersonAttachment,
  createPerson,
  karkunToPerson,
  removePerson,
  removePersonAttachment,
  searchPeople,
  setPersonImage,
  updatePerson,
} from 'meteor/idreesia-common/server/business-logic/common';

import { getKarkunsByPredefinedFilter } from 'meteor/idreesia-common/server/business-logic/hr/karkun-search';
import { promoteToKarkun } from 'meteor/idreesia-common/server/business-logic/hr/promote-karkun';
import {
  searchHrEmployeeCandidateKarkuns,
  searchHrKarkunCandidatePeople,
  searchHrPickerKarkuns,
} from 'meteor/idreesia-common/server/business-logic/hr/picker-karkuns';

// HR karkuns all belong to Multan.
const getMultanCity = async () => {
  const pakistan = await OrgLocations.findOneAsync({
    name: 'Pakistan',
    type: OrgLocationTypes.COUNTRY,
  });
  if (!pakistan) return null;
  return OrgLocations.findOneAsync({
    name: 'Multan',
    type: OrgLocationTypes.CITY,
    allParentIds: pakistan._id,
  });
};

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    hrCommitteeOptions: async () =>
      Committees.find({}, { sort: { name: 1 }, fields: { name: 1 } }).fetchAsync(),

    hrKarkunById: async (obj, { _id }) => People.findOneAsync(_id),

    hrKarkunsById: async (obj, { _ids }) => {
      const idsArray = _ids.split(',');
      return People.find({ _id: { $in: idsArray } }).fetchAsync();
    },

    pagedHrPickerKarkuns: async (obj, args) => searchHrPickerKarkuns(args),

    pagedHrEmployeeCandidateKarkuns: async (obj, args) =>
      searchHrEmployeeCandidateKarkuns(args),

    pagedHrKarkunCandidatePeople: async (obj, args) =>
      searchHrKarkunCandidatePeople(args),

    pagedHrKarkuns: async (obj, { filter }) => {
      const multanCity = await getMultanCity();

      if (!multanCity) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      if (filter.predefinedFilterName) {
        return getKarkunsByPredefinedFilter(filter);
      }

      return searchPeople(
        {
          ...filter,
          cityLocationId: multanCity._id,
        },
        {
          includeKarkuns: filter.isKarkun,
          includeEmployees: filter.isEmployee,
          includeVisitors: filter.isVisitor,
        }
      ).then(result => {
        const pagedResult = result as {
          data: unknown[];
          totalResults: number;
        };
        return {
          data: pagedResult.data,
          totalResults: pagedResult.totalResults,
        };
      });
    },
  },

  Mutation: {
    createHrKarkun: async (obj, values, { user }) => {
      const multanCity = await getMultanCity();
      if (!multanCity) throw new Error('Multan city is not configured.');
      const personValues = await karkunToPerson({
        ...values,
        isKarkun: true,
        isVisitor: true,
        cityLocationId: multanCity._id,
        dataSource: DataSource.HR,
        visitorData: {
          city: multanCity.name,
          country: 'Pakistan',
        },
      });
      return createPerson(personValues, user);
    },

    promoteHrKarkun: async (
      obj,
      { _id, cityLocationId, mehfilLocationId },
      { user }
    ) => promoteToKarkun(_id, { cityLocationId, mehfilLocationId }, user),

    updateHrKarkun: async (obj, values, { user }) => {
      const personValues = await karkunToPerson(values);
      return updatePerson(personValues, user);
    },

    deleteHrKarkun: async (obj, { _id }, { user }) =>
      removePerson(_id, user),

    setHrKarkunEmploymentInfo: async (obj, values, { user }) => {
      const personValues = await karkunToPerson(values);
      return updatePerson(personValues, user);
    },

    setHrKarkunProfileImage: async (obj, { _id, imageData }, { user }) =>
      setPersonImage(user, _id, imageData),

    addHrKarkunAttachment: async (obj, { _id, attachmentId }, { user }) =>
      addPersonAttachment({ _id, attachmentId }, user),

    removeHrKarkunAttachment: async (obj, { _id, attachmentId }, { user }) =>
      removePersonAttachment({ _id, attachmentId }, user),
  },
};

export default resolvers;
