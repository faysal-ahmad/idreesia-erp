import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Ehads } from 'meteor/idreesia-common/server/collections/hr';
// import {
//   IssuanceForms,
//   PurchaseForms,
//   StockAdjustments,
// } from 'meteor/idreesia-common/server/collections/inventory';
// import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';

// const bloodGroupValueConversion = {
//   'A-': 'A-',
//   Aplus: 'A+',
//   'B-': 'B-',
//   Bplus: 'B+',
//   'AB-': 'AB-',
//   ABplus: 'AB+',
//   'O-': 'O-',
//   Oplus: 'O+',
// };

function getEhadsByFilter(params) {
  const pipeline = [];

  const {
    name,
    fatherName,
    phoneNumber,
    city,
    marfat,  
    cnicNumber, 
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
        $or: [{ phoneNumber: phoneNumber }],
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

  const ehads = Ehads.aggregate(resultsPipeline).toArray();
  const totalResults = Ehads.aggregate(countingPipeline).toArray();

  return Promise.all([ehads, totalResults]).then(results => ({
    ehads: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}

function getEhadsByPredefinedFilter(params) {
  const { predefinedFilterName, pageIndex = '0', pageSize = '20' } = params;

  let EhadIds = [];
  let distincFunction;
 

  const pipeline = [
    {
      $match: {
        _id: { $in: EhadIds },
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

  const ehads = Ehads.aggregate(resultsPipeline).toArray();
  const totalResults = Ehads.aggregate(countingPipeline).toArray();

  return Promise.all([ehads, totalResults]).then(results => ({
    ehads: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}

export function getEhads(queryString) {
  const params = parse(queryString);
  const { predefinedFilterName } = params;

  if (predefinedFilterName) {
    return getEhadsByPredefinedFilter(params);
  }

  return getEhadsByFilter(params);
}
