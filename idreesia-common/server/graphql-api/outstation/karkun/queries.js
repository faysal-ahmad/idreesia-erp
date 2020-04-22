import moment from 'moment';
import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { Formats } from 'meteor/idreesia-common/constants';
import { BloodGroups } from 'meteor/idreesia-common/constants/hr';

function buildPipeline(params) {
  const pipeline = [];
  const multanCity = Cities.findOne({ name: 'Multan', country: 'Pakistan' });

  const {
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    lastTarteeb,
    attendance,
    dutyId,
    cityId,
    cityMehfilId,
    updatedBetween,
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

  if (attendance) {
    const { criteria, percentage } = JSON.parse(attendance);
    if (percentage) {
      const month = moment()
        .subtract(1, 'month')
        .startOf('month');

      const criteriaCondition =
        criteria === 'less-than'
          ? {
              $lte: ['$percentage', percentage],
            }
          : {
              $gte: ['$percentage', percentage],
            };

      pipeline.push({
        $lookup: {
          from: 'hr-attendances',
          let: { karkun_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$karkunId', '$$karkun_id'],
                    },
                    {
                      $eq: ['$month', month.format('MM-YYYY')],
                    },
                    criteriaCondition,
                  ],
                },
              },
            },
          ],
          as: 'attendances',
        },
      });

      pipeline.push({
        $match: {
          $expr: {
            $gte: [{ $size: '$attendances' }, 1],
          },
        },
      });
    }
  }

  if (cityId && cityId !== multanCity._id) {
    pipeline.push({
      $match: {
        cityId: { $eq: cityId },
      },
    });
  } else {
    pipeline.push({
      $match: {
        cityId: { $ne: multanCity._id },
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

  if (updatedBetween) {
    const updatedBetweenDates = JSON.parse(updatedBetween);

    if (updatedBetweenDates[0]) {
      pipeline.push({
        $match: {
          updatedAt: {
            $gte: moment(updatedBetweenDates[0], Formats.DATE_FORMAT)
              .startOf('day')
              .toDate(),
          },
        },
      });
    }
    if (updatedBetweenDates[1]) {
      pipeline.push({
        $match: {
          updatedAt: {
            $lte: moment(updatedBetweenDates[1], Formats.DATE_FORMAT)
              .endOf('day')
              .toDate(),
          },
        },
      });
    }
  }

  return pipeline;
}

export function getOutstationKarkuns(params) {
  const { pageIndex = '0', pageSize = '20' } = params;
  const pipeline = buildPipeline(params);
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

export function getOutstationKarkunsWithoutPagination(params) {
  const pipeline = buildPipeline(params);
  return Karkuns.aggregate(pipeline).toArray();
}
