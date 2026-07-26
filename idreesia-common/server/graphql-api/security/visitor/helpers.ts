import csv from 'csvtojson';
import { subYears } from 'date-fns';

import { toInteger } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';

const NAME_COLUMN = 'Name';
const PARENT_NAME_COLUMN = 'S/O';
const CNIC_COLUMN = 'CNIC';
const CITY_COLUMN = 'City';
const PHONE_COLUMN = 'Mobile No.';
const EHAD_DURATION_COLUMN = 'Arsa Ehad';
const REFERENCE_COLUMN = 'Maarfat';

type CsvRecord = Record<string, string | undefined>;

interface UserRef {
  _id: string;
}

async function processJsonRecord(
  jsonRecord: CsvRecord,
  date: Date,
  user: UserRef
) {
  try {
    const name = jsonRecord[NAME_COLUMN];
    const parentName = jsonRecord[PARENT_NAME_COLUMN];
    const cnicNumber = jsonRecord[CNIC_COLUMN];
    const phoneNumber = jsonRecord[PHONE_COLUMN];
    const city = jsonRecord[CITY_COLUMN];
    const ehadDuration = jsonRecord[EHAD_DURATION_COLUMN];
    const referenceName = jsonRecord[REFERENCE_COLUMN];

    if (!cnicNumber && !phoneNumber) return false;
    if (cnicNumber && (await People.isCnicInUse(cnicNumber))) return false;
    if (phoneNumber && (await People.isContactNumberInUse(phoneNumber)))
      return false;

    const ehadDurationYears = toInteger(ehadDuration);
    const ehadDate = subYears(new Date(), ehadDurationYears);

    await People.insertAsync({
      isEmployee: false,
      isKarkun: false,
      userid: null,
      sharedData: {
        name,
        parentName,
        cnicNumber,
        ehadDate,
        referenceName,
        contactNumber1: phoneNumber,
      },
      visitorData: {
        city,
        country: 'Pakistan',
      },
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });
  } catch {
    return false;
  }

  return true;
}

function convertToJson(csvData: string) {
  return csv().fromString(csvData) as unknown as Promise<CsvRecord[]>;
}

export async function processCsvData(
  csvData: string,
  date: Date,
  user: UserRef
) {
  const jsonArray = await convertToJson(csvData);
  const result = {
    imported: 0,
    ignored: 0,
  };

  for (const jsonRecord of jsonArray) {
    if (await processJsonRecord(jsonRecord, date, user)) {
      result.imported++;
    } else {
      result.ignored++;
    }
  }

  return JSON.stringify(result);
}
