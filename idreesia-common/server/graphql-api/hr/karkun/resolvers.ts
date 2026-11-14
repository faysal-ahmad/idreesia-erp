import { People } from 'meteor/idreesia-common/server/collections/common';
import { Committees } from 'meteor/idreesia-common/server/collections/hr';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
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

// HR karkuns all belong to Multan.
const getMultanCity = () =>
  Cities.findOneAsync({ name: 'Multan', country: 'Pakistan' });

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
          cityId: multanCity._id,
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
        cityId: multanCity._id,
        dataSource: DataSource.HR,
        visitorData: {
          city: multanCity.name,
          country: multanCity.country,
        },
      });
      return createPerson(personValues, user);
    },

    promoteHrKarkun: async (obj, { _id }, { user }) => {
      const existingPerson = await People.findOneAsync(_id);
      if (!existingPerson || existingPerson.deletedAt) {
        throw new Error('Person not found.');
      }
      if (existingPerson.isKarkun) {
        throw new Error('This person is already a karkun.');
      }

      const multanCity = await getMultanCity();
      if (!multanCity) throw new Error('Multan city is not configured.');

      const personValues = await karkunToPerson({
        _id,
        cityId: existingPerson.karkunData?.cityId || multanCity._id,
      });
      // Keep the visitor city the person already has. karkunToPerson would
      // replace it with the karkun city name.
      if (existingPerson.visitorData?.city) {
        delete personValues.visitorData;
      }
      return updatePerson(personValues, user);
    },

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
