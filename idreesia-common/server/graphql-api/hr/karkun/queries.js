import moment from 'moment';
import { get } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';
import {
  BloodGroups,
  PredefinedFilterNames,
} from 'meteor/idreesia-common/constants/hr';

function buildPipeline(params) {
  const pipeline = [];
  const multanCity = Cities.findOne({ name: 'Multan', country: 'Pakistan' });

  const {
    name,
    cnicNumber,
    phoneNumber,
    phoneNumbers,
    bloodGroup,
    lastTarteeb,
    jobId,
    dutyId,
    ehadKarkun,
    dutyShiftId,
    jobIds,
    dutyIds,
    dutyShiftIds,
    showVolunteers,
    showEmployees,
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
      'karkunData.cityId': { $eq: multanCity._id },
    },
  });

  if (showVolunteers === 'false' && showEmployees === 'false') {
    return {
      karkuns: [],
      totalResults: 0,
    };
  } else if (showVolunteers === 'true' && showEmployees === 'false') {
    pipeline.push({
      $match: {
        isKarkun: true,
        isEmployee: { $ne: true },
      },
    });
  } else if (showVolunteers === 'false' && showEmployees === 'true') {
    pipeline.push({
      $match: {
        isKarkun: false,
        isEmployee: { $eq: true },
      },
    });
  }

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

  if (phoneNumbers) {
    pipeline.push({
      $match: {
        'sharedData.contactNumber1': { $in: phoneNumbers },
      },
    });
  }

  if (bloodGroup) {
    const convertedBloodGroupValue = BloodGroups[bloodGroup];
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

  if (jobId) {
    pipeline.push({
      $match: {
        'karkunData.jobId': { $eq: jobId },
      },
    });
  }

  // Link the karkun-duties table if we are searching by dutyId or shiftId
  if (
    dutyId ||
    (!!dutyIds && dutyIds.length > 0) ||
    (!!dutyShiftIds && dutyShiftIds.length > 0)
  ) {
    pipeline.push({
      $lookup: {
        from: 'hr-karkun-duties',
        localField: '_id',
        foreignField: 'karkunId',
        as: 'duties',
      },
    });
  }

  if (dutyId) {
    pipeline.push({
      $match: {
        duties: {
          $elemMatch: {
            dutyId: { $eq: dutyId },
          },
        },
      },
    });

    if (dutyShiftId) {
      pipeline.push({
        $match: {
          duties: {
            $elemMatch: {
              shiftId: { $eq: dutyShiftId },
            },
          },
        },
      });
    }
  }

  if (
    (!!jobIds && jobIds.length > 0) ||
    (!!dutyIds && dutyIds.length > 0) ||
    (!!dutyShiftIds && dutyShiftIds.length > 0)
  ) {
    pipeline.push({
      $match: {
        $or: [
          { jobId: { $in: jobIds || [] } },
          {
            duties: {
              $elemMatch: {
                $or: [
                  { dutyId: { $in: dutyIds || [] } },
                  { shiftId: { $in: dutyShiftIds || [] } },
                ],
              },
            },
          },
        ],
      },
    });
  }

  return pipeline;
}

export function getKarkunsWithoutPagination(params) {
  const pipeline = buildPipeline(params);
  const people = People.aggregate(pipeline).toArray();
  return people.map(person => People.personToKarkun(person));
}

export function getKarkunsByFilter(params) {
  const pipeline = buildPipeline(params);
  const { pageIndex = '0', pageSize = '20' } = params;

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

function getKarkunsByPredefinedFilter(params) {
  const { predefinedFilterName, pageIndex = '0', pageSize = '20' } = params;

  let karkunIds = [];
  let distincFunction;

  switch (predefinedFilterName) {
    case PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY:
      distincFunction = Meteor.wrapAsync(
        PurchaseForms.rawCollection().distinct,
        PurchaseForms.rawCollection()
      );
      karkunIds = distincFunction('receivedBy');
      break;

    case PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO:
      distincFunction = Meteor.wrapAsync(
        PurchaseForms.rawCollection().distinct,
        PurchaseForms.rawCollection()
      );
      karkunIds = distincFunction('purchasedBy');
      break;

    case PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_BY_RECEIVED_BY:
      distincFunction = Meteor.wrapAsync(
        IssuanceForms.rawCollection().distinct,
        IssuanceForms.rawCollection()
      );
      karkunIds = distincFunction('issuedBy');
      break;

    case PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY:
      distincFunction = Meteor.wrapAsync(
        IssuanceForms.rawCollection().distinct,
        IssuanceForms.rawCollection()
      );
      karkunIds = distincFunction('issuedTo');
      break;

    case PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY:
      distincFunction = Meteor.wrapAsync(
        StockAdjustments.rawCollection().distinct,
        StockAdjustments.rawCollection()
      );
      karkunIds = distincFunction('adjustedBy');
      break;

    default:
      karkunIds = [];
      break;
  }

  const pipeline = [
    {
      $match: {
        _id: { $in: karkunIds },
      },
    },
  ];

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

export function getKarkuns(params) {
  const { predefinedFilterName } = params;

  if (predefinedFilterName) {
    return getKarkunsByPredefinedFilter(params);
  }

  return getKarkunsByFilter(params);
}
