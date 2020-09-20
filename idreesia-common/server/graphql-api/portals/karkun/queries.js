import moment from 'moment';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';

const bloodGroupValueConversion = {
  'A-': 'A-',
  Aplus: 'A+',
  'B-': 'B-',
  Bplus: 'B+',
  'AB-': 'AB-',
  ABplus: 'AB+',
  'O-': 'O-',
  Oplus: 'O+',
};

export function getPortalKarkuns(portalId, params) {
  const portal = Portals.findOne(portalId);
  const pipeline = [];

  const {
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    lastTarteeb,
    dutyId,
    ehadKarkun,
    cityId,
    cityMehfilId,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  if (name) {
    if (name.length === 1) {
      pipeline.push({
        $match: { name: { $regex: `^${name}` } },
      });
    } else {
      pipeline.push({
        $match: { $text: { $search: name } },
      });
    }
  }

  pipeline.push({
    $match: {
      cityId: { $in: portal.cityIds },
    },
  });

  if (cnicNumber) {
    pipeline.push({
      $match: {
        cnicNumber: { $eq: cnicNumber },
      },
    });
  }

  if (phoneNumber) {
    pipeline.push({
      $match: {
        $or: [{ contactNumber1: phoneNumber }, { contactNumber2: phoneNumber }],
      },
    });
  }

  if (bloodGroup) {
    const convertedBloodGroupValue = bloodGroupValueConversion[bloodGroup];
    pipeline.push({
      $match: {
        bloodGroup: { $eq: convertedBloodGroupValue },
      },
    });
  }

  if (ehadKarkun) {
    const ehadKarkunValue = ehadKarkun === 'true';
    pipeline.push({
      $match: {
        ehadKarkun: { $eq: ehadKarkunValue },
      },
    });
  }

  if (lastTarteeb) {
    const { scale, duration } = JSON.parse(lastTarteeb);
    if (duration) {
      const date = moment()
        .startOf('day')
        .subtract(duration, scale);

      pipeline.push({
        $match: {
          $or: [
            { lastTarteebDate: { $exists: false } },
            { lastTarteebDate: { $lte: moment(date).toDate() } },
          ],
        },
      });
    }
  }

  if (cityId) {
    pipeline.push({
      $match: {
        cityId: { $eq: cityId },
      },
    });
  } else {
    pipeline.push({
      $match: {
        cityId: { $exists: true },
      },
    });
  }

  if (cityMehfilId) {
    pipeline.push({
      $match: {
        cityMehfilId: { $eq: cityMehfilId },
      },
    });
  }

  if (dutyId) {
    pipeline.push({
      $lookup: {
        from: 'hr-karkun-duties',
        localField: '_id',
        foreignField: 'karkunId',
        as: 'duties',
      },
    });
    pipeline.push({
      $match: {
        duties: {
          $elemMatch: {
            dutyId: { $eq: dutyId },
          },
        },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { name: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const karkuns = Karkuns.aggregate(resultsPipeline).toArray();
  const totalResults = Karkuns.aggregate(countingPipeline).toArray();

  return Promise.all([karkuns, totalResults]).then(results => ({
    karkuns: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
