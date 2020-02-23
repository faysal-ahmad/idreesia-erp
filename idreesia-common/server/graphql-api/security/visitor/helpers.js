import csv from 'csvtojson';
import moment from 'moment';

import { toInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';

const NAME_COLUMN = 'Name';
const PARENT_NAME_COLUMN = 'S/O';
const CNIC_COLUMN = 'CNIC';
const CITY_COLUMN = 'City';
const PHONE_COLUMN = 'Mobile No.';
const EHAD_DURATION_COLUMN = 'Arsa Ehad';
const REFERENCE_COLUMN = 'Maarfat';

function processJsonRecord(jsonRecord, date, user) {
  try {
    const name = jsonRecord[NAME_COLUMN];
    const parentName = jsonRecord[PARENT_NAME_COLUMN];
    const cnicNumber = jsonRecord[CNIC_COLUMN];
    const phoneNumber = jsonRecord[PHONE_COLUMN];
    const city = jsonRecord[CITY_COLUMN];
    const ehadDuration = jsonRecord[EHAD_DURATION_COLUMN];
    const referenceName = jsonRecord[REFERENCE_COLUMN];

    if (!cnicNumber && !phoneNumber) return false;
    if (cnicNumber && Visitors.isCnicInUse(cnicNumber)) return false;
    if (phoneNumber && Visitors.isContactNumberInUse(phoneNumber)) return false;

    const ehadDurationYears = toInteger(ehadDuration);
    const ehadDate = moment()
      .subtract(ehadDurationYears, 'years')
      .toDate();

    Visitors.insert({
      name,
      parentName,
      cnicNumber,
      ehadDate,
      referenceName,
      contactNumber1: phoneNumber,
      city,
      country: 'Pakistan',
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });
  } catch (error) {
    return false;
  }

  return true;
}

function convertToJson(csvData) {
  return new Promise((resolve, reject) => {
    csv()
      .fromString(csvData)
      .then(jsonArray => {
        resolve(jsonArray);
      })
      .catch(err => {
        reject(err);
      });
  });
}

export async function processCsvData(csvData, date, user) {
  return convertToJson(csvData).then(jsonArray => {
    const result = {
      imported: 0,
      ignored: 0,
    };

    jsonArray.forEach(jsonRecord => {
      if (processJsonRecord(jsonRecord, date, user)) {
        result.imported++;
      } else {
        result.ignored++;
      }
    });

    return JSON.stringify(result);
  });
}
