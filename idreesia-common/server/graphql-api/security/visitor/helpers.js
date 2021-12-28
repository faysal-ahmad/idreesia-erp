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

export function visitorToPerson(visitor) {
  return {
    _id: visitor._id,
    dataSource: visitor.dataSource,
    sharedData: {
      name: visitor.name,
      parentName: visitor.parentName,
      cnicNumber: visitor.cnicNumber,
      ehadDate: visitor.ehadDate,
      birthDate: visitor.birthDate,
      referenceName: visitor.referenceName,
      contactNumber1: visitor.contactNumber1,
      contactNumber2: visitor.contactNumber2,
      currentAddress: visitor.currentAddress,
      permanentAddress: visitor.permanentAddress,
      educationalQualification: visitor.educationalQualification,
      meansOfEarning: visitor.meansOfEarning,
    },
    visitorData: {
      city: visitor.city,
      country: visitor.country,
    },
  };
}

export function personToVisitor(person) {
  return {
    _id: person._id,
    dataSource: person.dataSource,
    createdAt: person.createdAt,
    createdBy: person.createdBy,
    updatedAt: person.updatedAt,
    updatedBy: person.updatedBy,

    name: person.sharedData.name,
    parentName: person.sharedData.parentName,
    cnicNumber: person.sharedData.cnicNumber,
    ehadDate: person.sharedData.ehadDate,
    birthDate: person.sharedData.birthDate,
    referenceName: person.sharedData.referenceName,
    contactNumber1: person.sharedData.contactNumber1,
    contactNumber2: person.sharedData.contactNumber2,
    contactNumber1Subscribed: person.sharedData.contactNumber1Subscribed,
    contactNumber2Subscribed: person.sharedData.contactNumber2Subscribed,
    currentAddress: person.sharedData.currentAddress,
    permanentAddress: person.sharedData.permanentAddress,
    educationalQualification: person.sharedData.educationalQualification,
    meansOfEarning: person.sharedData.meansOfEarning,
    imageId: person.sharedData.imageId,

    city: person.visitorData?.city,
    country: person.visitorData?.country,
    criminalRecord: person.visitorData?.criminalRecord,
    otherNotes: person.visitorData?.otherNotes,

    karkunId: person.karkunData?.karkunId,
  };
}
