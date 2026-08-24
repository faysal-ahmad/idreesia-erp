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
    pagedSecurityPeople: async (obj, { filter }) =>
      People.searchPeople(filter, {
        includeVisitors: true,
        includeKarkuns: true,
      }),

    securityPersonById: async (obj, { _id }) => People.findOneAsync(_id),

    securityPersonByCnic: async (obj, { cnicNumbers }) => {
      if (cnicNumbers.length > 0) {
        return People.findOneAsync({
          'sharedData.cnicNumber': { $in: cnicNumbers },
        });
      }

      return null;
    },
  },

  Mutation: {
    createSecurityVisitorPerson: async (
      obj,
      { sharedData, visitorData },
      { user }
    ) =>
      People.createPerson(
        {
          isVisitor: true,
          dataSource: DataSource.SECURITY,
          sharedData,
          visitorData,
        },
        user
      ),

    updateSecurityVisitorPerson: async (
      obj,
      { _id, sharedData, visitorData },
      { user }
    ) => People.updatePerson({ _id, sharedData, visitorData }, user),

    updateSecurityPersonVisitorData: async (
      obj,
      { _id, criminalRecord, otherNotes },
      { user }
    ) =>
      People.updatePerson(
        { _id, visitorData: { criminalRecord, otherNotes } },
        user
      ),

    deleteSecurityPerson: async (obj, { _id }) => People.removeAsync(_id),

    setSecurityPersonImage: async (obj, { _id, imageId }, { user }) => {
      const imageVectorData = await computeImageVectorData(imageId);
      return People.updatePerson(
        { _id, sharedData: { imageId, imageVectorData } },
        user
      );
    },

    importSecurityVisitorsCsvData: async (obj, { csvData }, { user }) =>
      processCsvData(csvData, new Date(), user),
  },
};

export default resolvers;
