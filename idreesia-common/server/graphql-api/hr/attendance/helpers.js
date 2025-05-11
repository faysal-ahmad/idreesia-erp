import { Random } from 'meteor/random';
import csv from 'csvtojson';

import { round } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Attendances,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';

const NAME_COLUMN = 'Name';
const CNIC_COLUMN = 'CNIC';
const PHONE_COLUMN = 'Phone No.';

function getAttendanceValues(jsonRecord) {
  const attendanceDetails = {};

  let presentCount = 0;
  let absentCount = 0;

  for (let i = 1; i <= 31; i++) {
    const attendanceVal = jsonRecord[i.toString()]?.replace(/[^aApPlL ]/g, '');
    if (attendanceVal === 'P' || attendanceVal === 'p') {
      attendanceDetails[i.toString()] = 'pr';
      presentCount++;
    } else if (attendanceVal) {
      // Any other value then "P" or "p" is to be considered absent
      // Blank/missing value is considered as day off
      attendanceDetails[i.toString()] = 'ab';
      absentCount++;
    }
  }

  return {
    totalCount: presentCount + absentCount,
    presentCount,
    absentCount,
    percentage:
      presentCount + absentCount !== 0
        ? round((presentCount / (presentCount + absentCount)) * 100)
        : 0,
    attendanceDetails: JSON.stringify(attendanceDetails),
  };
}

function processJsonRecord(jsonRecord, month, dutyId, shiftId) {
  try {
    const karkunCnic = jsonRecord[CNIC_COLUMN];
    const karkunName = jsonRecord[NAME_COLUMN];
    const phoneNumber = jsonRecord[PHONE_COLUMN];

    if (!karkunCnic && !phoneNumber) return;

    let person;
    if (karkunCnic) {
      person = People.findOne({
        'sharedData.cnicNumber': { $eq: karkunCnic },
      });
    } else {
      person = People.findOne({
        'sharedData.contactNumber1': { $eq: phoneNumber },
      });
    }

    if (!person) {
      throw new Error(
        `Could not find a person with name '${karkunName}' against CNIC '${karkunCnic}' or contact number '${phoneNumber}'.`
      );
    }

    // Do not import the attendance of this karkun, unless he has been assigned
    // to this dutyId/shiftId
    let karkunDuty;
    if (shiftId) {
      karkunDuty = KarkunDuties.findOne({
        karkunId: person._id,
        dutyId,
        shiftId,
      });
    } else {
      karkunDuty = KarkunDuties.findOne({
        karkunId: person._id,
        dutyId,
      });
    }

    if (!karkunDuty) return;

    // If there is already an attendance present for this karkun/month/duty/shift combination
    // then update that, otherwise insert a new one.
    let attendance = shiftId
      ? Attendances.findOne({
          karkunId: person._id,
          dutyId,
          shiftId,
          month,
        })
      : Attendances.findOne({
          karkunId: person._id,
          dutyId,
          month,
        });

    if (!attendance) {
      const attendanceId = Attendances.insert({
        karkunId: person._id,
        dutyId,
        shiftId,
        month,
        meetingCardBarcodeId: Random.id(8),
      });

      attendance = Attendances.findOne(attendanceId);
    }

    let meetingCardBarcodeId = attendance.meetingCardBarcodeId;
    if (!meetingCardBarcodeId) {
      meetingCardBarcodeId = Random.id(8);
    }

    const attendanceValues = getAttendanceValues(jsonRecord);
    Attendances.update(attendance._id, {
      $set: Object.assign({}, attendanceValues, {
        meetingCardBarcodeId,
      }),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
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

export async function processAttendanceSheet(csvData, month, dutyId, shiftId) {
  return convertToJson(csvData).then(jsonArray => {
    jsonArray.forEach(jsonRecord => {
      processJsonRecord(jsonRecord, month, dutyId, shiftId);
    });

    return jsonArray.length;
  });
}
