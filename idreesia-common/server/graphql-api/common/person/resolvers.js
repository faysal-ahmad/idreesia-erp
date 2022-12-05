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

export default {
  PersonSharedDataType: {
    image: async personSharedDataType => {
      const { imageId } = personSharedDataType;
      if (imageId) {
        return Attachments.findOne({ _id: { $eq: imageId } });
      }

      return null;
    },
  },
  PersonKarkunDataType: {
    city: async personKarkunDataType => {
      if (!personKarkunDataType.cityId) return null;
      return Cities.findOne(personKarkunDataType.cityId);
    },
    cityMehfil: async personKarkunDataType => {
      if (!personKarkunDataType.cityMehfilId) return null;
      return CityMehfils.findOne(personKarkunDataType.cityMehfilId);
    },
    duties: async personKarkunDataType =>
      KarkunDuties.find({
        karkunId: { $eq: personKarkunDataType._id },
      }).fetch(),
    attachments: async personKarkunDataType => {
      const { attachmentIds } = personKarkunDataType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetch();
      }

      return [];
    },
  },
  PersonEmployeeDataType: {
    job: async personEmployeeDataType => {
      if (!personEmployeeDataType.jobId) return null;
      return Jobs.findOne(personEmployeeDataType.jobId);
    },
  },

  Query: {
    pagedPeople: async (obj, { filter }) =>
      People.searchPeople(filter, {
        includeVisitors: true,
        includeKarkuns: true,
        includeEmployees: true,
      }),
  },
};
