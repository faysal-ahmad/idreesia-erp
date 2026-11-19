import { People } from 'meteor/idreesia-common/server/collections/common';
import { DataSource, ImageVectorStatus } from 'meteor/idreesia-common/constants';
import {
  computeVectorFromImageBuffer,
  createPerson,
  removePerson,
  searchPeople,
  searchPeopleByFaceVector,
  setPersonImage,
  updatePerson,
  visitorToPerson,
} from 'meteor/idreesia-common/server/business-logic/common';

import { processCsvData } from 'meteor/idreesia-common/server/business-logic/security/visitor-csv-import';

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
      searchPeople(filter, {
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
      const personValues = visitorToPerson(values);
      return createPerson(
        {
          ...personValues,
          dataSource: DataSource.SECURITY,
        },
        user
      );
    },

    updateSecurityVisitor: async (obj, values, { user }) => {
      const personValues = visitorToPerson(values);
      return updatePerson(personValues, user);
    },

    deleteSecurityVisitor: async (obj, { _id }, { user }) =>
      removePerson(_id, user),

    setSecurityVisitorImage: async (obj, { _id, imageData }, { user }) =>
      setPersonImage(user, _id, imageData),

    updateSecurityVisitorNotes: async (obj, values, { user }) => {
      const personValues = visitorToPerson(values);
      return updatePerson(personValues, user);
    },

    importSecurityVisitorsCsvData: async (obj, { csvData }, { user }) =>
      processCsvData(csvData, new Date(), user),
  },
};

export default resolvers;
