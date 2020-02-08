import { parse } from 'query-string';

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

export function getPortalKarkuns(portalId, queryString) {
  const portal = Portals.findOne(portalId);
  const params = parse(queryString);
  const pipeline = [];

  const {
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    dutyId,
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

export function getPortalKarkunsByVisitor(
  portalId,
  visitorName,
  visitorCnic,
  visitorPhone
) {
  const portal = Portals.findOne(portalId);

  let karkun;

  // First try to find a karkun by cnic
  if (visitorCnic) {
    karkun = Karkuns.findOne({
      cnicNumber: { $eq: visitorCnic },
      cityId: { $in: portal.cityIds },
    });

    if (karkun) {
      return {
        karkuns: [karkun],
        totalResults: 1,
      };
    }
  }

  // Try finding by contact number
  if (visitorPhone) {
    karkun = Karkuns.findOne({
      $or: [{ contactNumber1: visitorPhone }, { contactNumber2: visitorPhone }],
      cityId: { $in: portal.cityIds },
    });

    if (karkun) {
      return {
        karkuns: [karkun],
        totalResults: 1,
      };
    }
  }

  // Finally lookup by name
  const pipeline = [
    {
      $match: { $text: { $search: visitorName } },
    },
    {
      $match: {
        cityId: { $in: portal.cityIds },
      },
    },
    { $sort: { name: 1 } },
    { $limit: 20 },
  ];

  return Karkuns.aggregate(pipeline)
    .toArray()
    .then(karkuns => ({
      karkuns,
      totalResults: karkuns.length,
    }));
}
