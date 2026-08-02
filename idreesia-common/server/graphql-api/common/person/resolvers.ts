import {
  Jobs,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';
import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';
import {
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';

interface PersonSharedDataType {
  imageId?: string;
}

interface PersonKarkunDataType {
  _id: string;
  cityId?: string;
  cityMehfilId?: string;
  attachmentIds?: string[];
}

interface PersonEmployeeDataType {
  jobId?: string;
}

interface PagedPeopleArgs {
  filter?: Record<string, unknown>;
}

export default {
  PersonSharedDataType: {
    image: async (personSharedDataType: PersonSharedDataType) => {
      const { imageId } = personSharedDataType;
      if (imageId) {
        return Attachments.findOneAsync({ _id: { $eq: imageId } });
      }

      return null;
    },
  },
  PersonKarkunDataType: {
    city: async (personKarkunDataType: PersonKarkunDataType) => {
      if (!personKarkunDataType.cityId) return null;
      return Cities.findOneAsync(personKarkunDataType.cityId);
    },
    cityMehfil: async (personKarkunDataType: PersonKarkunDataType) => {
      if (!personKarkunDataType.cityMehfilId) return null;
      return CityMehfils.findOneAsync(personKarkunDataType.cityMehfilId);
    },
    duties: async (personKarkunDataType: PersonKarkunDataType) =>
      KarkunDuties.find({
        karkunId: { $eq: personKarkunDataType._id },
      }).fetchAsync(),
    attachments: async (personKarkunDataType: PersonKarkunDataType) => {
      const { attachmentIds } = personKarkunDataType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetchAsync();
      }

      return [];
    },
  },
  PersonEmployeeDataType: {
    job: async (personEmployeeDataType: PersonEmployeeDataType) => {
      if (!personEmployeeDataType.jobId) return null;
      return Jobs.findOneAsync(personEmployeeDataType.jobId);
    },
  },

  Query: {
    pagedPeople: async (_obj: unknown, { filter }: PagedPeopleArgs) =>
      People.searchPeople(filter, {
        includeVisitors: true,
        includeKarkuns: true,
        includeEmployees: true,
      }),
  },
};
