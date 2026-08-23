import { People } from 'meteor/idreesia-common/server/collections/common';
import { computeImageVectorData } from 'meteor/idreesia-common/server/business-logic/common';
import { DataSource } from 'meteor/idreesia-common/constants';

import { processCsvData } from './helpers';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    pagedSecurityVisitors: async (obj, { filter }) =>
      People.searchPeople(filter, {
        includeVisitors: true,
        includeKarkuns: true,
      }).then(result => {
        const pagedResult = result as {
          data: Parameters<typeof People.personToVisitor>[0][];
          totalResults: number;
        };
        return {
          data: pagedResult.data.map(person => People.personToVisitor(person)),
          totalResults: pagedResult.totalResults,
        };
      }),

    securityVisitorById: async (obj, { _id }) => {
      const person = await People.findOneAsync(_id);
      return People.personToVisitor(person);
    },

    securityVisitorByCnic: async (obj, { cnicNumbers }) => {
      if (cnicNumbers.length > 0) {
        const person = await People.findOneAsync({
          'sharedData.cnicNumber': { $in: cnicNumbers },
        });
        return People.personToVisitor(person);
      }

      return null;
    },

    securityVisitorByCnicOrContactNumber: async (
      obj,
      { cnicNumber, contactNumber }
    ) => {
      const person = await People.findByCnicOrContactNumber(
        cnicNumber,
        contactNumber
      );
      return People.personToVisitor(person);
    },
  },

  Mutation: {
    createSecurityVisitor: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = await People.createPerson(
        {
          ...personValues,
          dataSource: DataSource.SECURITY,
        },
        user
      );
      return People.personToVisitor(person);
    },

    updateSecurityVisitor: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = await People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    deleteSecurityVisitor: async (obj, { _id }) => People.removeAsync(_id),

    setSecurityVisitorImage: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      personValues.sharedData.imageVectorData = await computeImageVectorData(
        values.imageId
      );
      const person = await People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    updateSecurityVisitorNotes: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = await People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    importSecurityVisitorsCsvData: async (obj, { csvData }, { user }) =>
      processCsvData(csvData, new Date(), user),
  },
};

export default resolvers;
