import moment from 'moment';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { AmaanatLogs } from 'meteor/idreesia-common/server/collections/accounts';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { Formats } from 'meteor/idreesia-common/constants';

export default function getAmaanatLogs(portalId, params) {
  const portal = Portals.findOne(portalId);
  const pipeline = [];

  const {
    cityId,
    cityMehfilId,
    hasPortion,
    startDate,
    endDate,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  if (cityId) {
    pipeline.push({
      $match: {
        cityId: { $eq: cityId },
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

  if (!cityId && !cityMehfilId) {
    pipeline.push({
      $match: {
        cityId: { $in: portal.cityIds },
      },
    });
  }

  if (hasPortion) {
    if (hasPortion === 'hasHadiaPortion') {
      pipeline.push({
        $match: {
          hadiaPortion: { $exists: true, $ne: null },
        },
      });
    } else if (hasPortion === 'hasSadqaPortion') {
      pipeline.push({
        $match: {
          sadqaPortion: { $exists: true, $ne: null },
        },
      });
    } else if (hasPortion === 'hasZakaatPortion') {
      pipeline.push({
        $match: {
          zakaatPortion: { $exists: true, $ne: null },
        },
      });
    } else if (hasPortion === 'hasLangarPortion') {
      pipeline.push({
        $match: {
          langarPortion: { $exists: true, $ne: null },
        },
      });
    } else if (hasPortion === 'hasOtherPortion') {
      pipeline.push({
        $match: {
          otherPortion: { $exists: true, $ne: null },
        },
      });
    }
  }

  if (startDate) {
    pipeline.push({
      $match: {
        sentDate: {
          $gte: moment(startDate, Formats.DATE_FORMAT)
            .startOf('day')
            .toDate(),
        },
      },
    });
  }
  if (endDate) {
    pipeline.push({
      $match: {
        sentDate: {
          $lte: moment(endDate, Formats.DATE_FORMAT)
            .endOf('day')
            .toDate(),
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
    { $sort: { sentDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const amaanatLogs = AmaanatLogs.aggregate(resultsPipeline);
  const totalResults = AmaanatLogs.aggregate(countingPipeline);

  return Promise.all([amaanatLogs, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
