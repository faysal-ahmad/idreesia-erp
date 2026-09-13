import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  computeImageVectorData,
  computeVectorFromImageBuffer,
  searchPeopleByFaceVector,
} from 'meteor/idreesia-common/server/business-logic/common';
import { DataSource, ImageVectorStatus } from 'meteor/idreesia-common/constants';

import { processCsvData } from './helpers';

// The capture control sends a canvas data URL; tolerate it with or without the prefix.
const stripDataUrlPrefix = (imageData: string) =>
  imageData.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

const DEFAULT_FACE_SEARCH_LIMIT = 5;

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

    securityFaceVectorFromImage: async (obj, { imageData }) => {
      const { vector, status } = computeVectorFromImageBuffer(
        Buffer.from(stripDataUrlPrefix(imageData), 'base64')
      );

      // Only hand back a vector the caller can actually search with - every other status is a
      // reason for the dialog to ask for a different photo.
      return {
        status,
        vector: status === ImageVectorStatus.COMPUTED ? vector : null,
      };
    },

    securityVisitorsByFaceVector: async (obj, { vector, limit }) =>
      searchPeopleByFaceVector(vector, limit ?? DEFAULT_FACE_SEARCH_LIMIT),
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
