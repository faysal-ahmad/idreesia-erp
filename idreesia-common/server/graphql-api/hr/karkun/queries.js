import moment from 'moment';
import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
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
    dutyShiftId,
    showVolunteers,
    showEmployees,
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
      cityId: { $eq: multanCity._id },
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
        isEmployee: { $ne: true },
      },
    });
  } else if (showVolunteers === 'false' && showEmployees === 'true') {
    pipeline.push({
      $match: {
        isEmployee: { $eq: true },
      },
    });
  }

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

  if (phoneNumbers) {
    pipeline.push({
      $match: {
        contactNumber1: { $in: phoneNumbers },
      },
    });
  }

  if (bloodGroup) {
    const convertedBloodGroupValue = BloodGroups[bloodGroup];
    pipeline.push({
      $match: {
        bloodGroup: { $eq: convertedBloodGroupValue },
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

  if (jobId) {
    pipeline.push({
      $match: {
        jobId: { $eq: jobId },
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

  return pipeline;
}

export function getKarkunsWithoutPagination(params) {
  const pipeline = buildPipeline(params);
  return Karkuns.aggregate(pipeline).toArray();
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

  const karkuns = Karkuns.aggregate(resultsPipeline).toArray();
  const totalResults = Karkuns.aggregate(countingPipeline).toArray();

  return Promise.all([karkuns, totalResults]).then(results => ({
    karkuns: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
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

  const karkuns = Karkuns.aggregate(resultsPipeline).toArray();
  const totalResults = Karkuns.aggregate(countingPipeline).toArray();

  return Promise.all([karkuns, totalResults]).then(results => ({
    karkuns: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}

export function getKarkuns(params) {
  const { predefinedFilterName } = params;

  if (predefinedFilterName) {
    return getKarkunsByPredefinedFilter(params);
  }

  return getKarkunsByFilter(params);
}
