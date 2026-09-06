import { People } from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { computeImageVectorData } from 'meteor/idreesia-common/server/business-logic/common';
import { DataSource } from 'meteor/idreesia-common/constants';

import { getKarkunsByPredefinedFilter } from './queries';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    hrKarkunById: async (obj, { _id }) => People.findOneAsync(_id),

    hrKarkunsById: async (obj, { _ids }) => {
      const idsArray = _ids.split(',');
      return People.find({ _id: { $in: idsArray } }).fetchAsync();
    },

    pagedHrKarkuns: async (obj, { filter }) => {
      const multanCity = await Cities.findOneAsync({
        name: 'Multan',
        country: 'Pakistan',
      });

      if (!multanCity) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      if (filter.predefinedFilterName) {
        return getKarkunsByPredefinedFilter(filter);
      }

      return People.searchPeople(
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
      const multanCity = await Cities.getMultanCity();
      if (!multanCity) throw new Error('Multan city is not configured.');
      const personValues = await People.karkunToPerson({
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
      return People.createPerson(personValues, user);
    },

    updateHrKarkun: async (obj, values, { user }) => {
      const personValues = await People.karkunToPerson(values);
      return People.updatePerson(personValues, user);
    },

    deleteHrKarkun: async (obj, { _id }, { user }) =>
      People.removePerson(_id, user),

    setHrKarkunWazaifAndRaabta: async (obj, values, { user }) => {
      const personValues = await People.karkunToPerson(values);
      return People.updatePerson(personValues, user);
    },

    setHrKarkunEmploymentInfo: async (obj, values, { user }) => {
      const personValues = await People.karkunToPerson(values);
      return People.updatePerson(personValues, user);
    },

    setHrKarkunProfileImage: async (obj, values, { user }) => {
      const personValues = await People.karkunToPerson(values);
      personValues.sharedData.imageVectorData = await computeImageVectorData(
        values.imageId
      );
      return People.updatePerson(personValues, user);
    },

    addHrKarkunAttachment: async (obj, { _id, attachmentId }, { user }) =>
      People.addAttachment({ _id, attachmentId }, user),

    removeHrKarkunAttachment: async (obj, { _id, attachmentId }, { user }) =>
      People.removeAttachment({ _id, attachmentId }, user),
  },
};

export default resolvers;
