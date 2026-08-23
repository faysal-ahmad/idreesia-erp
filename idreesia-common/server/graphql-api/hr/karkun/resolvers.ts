import { People } from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import {
  canDeleteKarkun,
  deleteKarkun,
} from 'meteor/idreesia-common/server/business-logic/hr';
import { computeImageVectorData } from 'meteor/idreesia-common/server/business-logic/common';
import { DataSource } from 'meteor/idreesia-common/constants';

import { getKarkunsByPredefinedFilter } from './queries';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    hrKarkunById: async (obj, { _id }) => {
      const person = await People.findOneAsync(_id);
      return People.personToKarkun(person);
    },

    hrKarkunsById: async (obj, { _ids }) => {
      const idsArray = _ids.split(',');
      const people = await People.find({ _id: { $in: idsArray } }).fetchAsync();
      return people.map((person: Parameters<typeof People.personToKarkun>[0]) =>
        People.personToKarkun(person)
      );
    },

    pagedHrKarkuns: async (obj, { filter }) => {
      const multanCity = await Cities.findOneAsync({
        name: 'Multan',
        country: 'Pakistan',
      });

      if (!multanCity) {
        return {
          karkuns: [],
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
          includeVisitors: filter.showVolunteers === 'true',
          includeKarkuns: filter.showVolunteers === 'true',
          includeEmployees: filter.showEmployees === 'true',
        }
      ).then(result => {
        const pagedResult = result as {
          data: Parameters<typeof People.personToKarkun>[0][];
          totalResults: number;
        };
        return {
          karkuns: pagedResult.data.map(person => People.personToKarkun(person)),
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
      const person = await People.createPerson(personValues, user);
      return People.personToKarkun(person);
    },

    updateHrKarkun: async (obj, values, { user }) => {
      const personValues = await People.karkunToPerson(values);
      const person = await People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    deleteHrKarkun: async (obj, { _id }) => {
      if (await canDeleteKarkun(_id)) {
        return deleteKarkun(_id);
      }

      return 0;
    },

    setHrKarkunWazaifAndRaabta: async (obj, values, { user }) => {
      const personValues = await People.karkunToPerson(values);
      const person = await People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setHrKarkunEmploymentInfo: async (obj, values, { user }) => {
      const personValues = await People.karkunToPerson(values);
      const person = await People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setHrKarkunProfileImage: async (obj, values, { user }) => {
      const personValues = await People.karkunToPerson(values);
      personValues.sharedData.imageVectorData = await computeImageVectorData(
        values.imageId
      );
      const person = await People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    addHrKarkunAttachment: async (obj, { _id, attachmentId }, { user }) => {
      const person = await People.addAttachment({ _id, attachmentId }, user);
      return People.personToKarkun(person);
    },

    removeHrKarkunAttachment: async (obj, { _id, attachmentId }, { user }) => {
      const person = await People.removeAttachment(
        { _id, attachmentId },
        user
      );
      return People.personToKarkun(person);
    },
  },
};

export default resolvers;
