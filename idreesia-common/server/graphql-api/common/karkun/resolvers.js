import {
  Jobs,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import {
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';

export default {
  KarkunType: {
    image: karkunType => {
      const { imageId } = karkunType;
      if (imageId) {
        return Attachments.findOne({ _id: { $eq: imageId } });
      }

      return null;
    },
    job: karkunType => {
      if (!karkunType.jobId) return null;
      return Jobs.findOne(karkunType.jobId);
    },
    duties: karkunType =>
      KarkunDuties.find({
        karkunId: { $eq: karkunType._id },
      }).fetch(),
    attachments: karkunType => {
      const { attachmentIds } = karkunType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetch();
      }

      return [];
    },
    city: karkunType => {
      if (!karkunType.cityId) return null;
      return Cities.findOne(karkunType.cityId);
    },
    cityMehfil: karkunType => {
      if (!karkunType.cityMehfilId) return null;
      return CityMehfils.findOne(karkunType.cityMehfilId);
    },
  },
};
