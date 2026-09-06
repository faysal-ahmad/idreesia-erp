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
      }),

    securityVisitorById: async (obj, { _id }) => People.findOneAsync(_id),

    securityVisitorByCnic: async (obj, { cnicNumbers }) => {
      if (cnicNumbers.length > 0) {
        return People.findOneAsync({
          'sharedData.cnicNumber': { $in: cnicNumbers },
        });
      }

      return null;
    },

    securityVisitorByCnicOrContactNumber: async (
      obj,
      { cnicNumber, contactNumber }
    ) => People.findByCnicOrContactNumber(cnicNumber, contactNumber),
  },

  Mutation: {
    createSecurityVisitor: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      return People.createPerson(
        {
          ...personValues,
          dataSource: DataSource.SECURITY,
        },
        user
      );
    },

    updateSecurityVisitor: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      return People.updatePerson(personValues, user);
    },

    deleteSecurityVisitor: async (obj, { _id }, { user }) =>
      People.removePerson(_id, user),

    setSecurityVisitorImage: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      personValues.sharedData.imageVectorData = await computeImageVectorData(
        values.imageId
      );
      return People.updatePerson(personValues, user);
    },

    updateSecurityVisitorNotes: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      return People.updatePerson(personValues, user);
    },

    importSecurityVisitorsCsvData: async (obj, { csvData }, { user }) =>
      processCsvData(csvData, new Date(), user),
  },
};

export default resolvers;
