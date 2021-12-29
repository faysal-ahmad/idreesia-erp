import moment from 'moment';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
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
        $match: { 'sharedData.name': { $regex: `^${name}` } },
      });
    } else {
      pipeline.push({
        $match: { $text: { $search: name } },
      });
    }
  }

  pipeline.push({
    $match: {
      'karkunData.cityId': { $in: portal.cityIds },
    },
  });

  if (cnicNumber) {
    pipeline.push({
      $match: {
        'sharedData.cnicNumber': { $eq: cnicNumber },
      },
    });
  }

  if (phoneNumber) {
    pipeline.push({
      $match: {
        $or: [
          { 'sharedData.contactNumber1': phoneNumber },
          { 'sharedData.contactNumber2': phoneNumber },
        ],
      },
    });
  }

  if (bloodGroup) {
    const convertedBloodGroupValue = bloodGroupValueConversion[bloodGroup];
    pipeline.push({
      $match: {
        'sharedData.bloodGroup': { $eq: convertedBloodGroupValue },
      },
    });
  }

  if (ehadKarkun) {
    const ehadKarkunValue = ehadKarkun === 'true';
    pipeline.push({
      $match: {
        'karkunData.ehadKarkun': { $eq: ehadKarkunValue },
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
            { 'karkunData.lastTarteebDate': { $exists: false } },
            { 'karkunData.lastTarteebDate': { $lte: moment(date).toDate() } },
          ],
        },
      });
    }
  }

  if (cityId) {
    pipeline.push({
      $match: {
        'karkunData.cityId': { $eq: cityId },
      },
    });
  } else {
    pipeline.push({
      $match: {
        'karkunData.cityId': { $exists: true },
      },
    });
  }

  if (cityMehfilId) {
    pipeline.push({
      $match: {
        'karkunData.cityMehfilId': { $eq: cityMehfilId },
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

  const people = People.aggregate(resultsPipeline).toArray();
  const totalResults = People.aggregate(countingPipeline).toArray();

  return Promise.all([people, totalResults]).then(results => {
    const karkuns = results[0].map(person => People.personToKarkun(person));
    return {
      karkuns,
      totalResults: get(results[1], ['0', 'total'], 0),
    };
  });
}
