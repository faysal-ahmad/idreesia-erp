import { Random } from 'meteor/random';
import csv from 'csvtojson';
import moment from 'moment';
import { toInteger, round } from 'lodash';

import { Attendances, Karkuns } from 'meteor/idreesia-common/collections/hr';
import { Formats } from 'meteor/idreesia-common/constants';

const ID_COLUMN = 'System ID';
const CNIC_COLUMN = 'CNIC';
const NAME_COLUMN = 'Name';
const PHONE_COLUMN = 'Phone No.';
const BLOOD_GROUP_COLUMN = 'Blood Group';
const PRESENT_COLUMN = 'P';
const ABSENT_COLUMN = 'A';
const TOTAL_COLUMN = 'Day';

function createKarkun(
  karkunCnic,
  karkunName,
  phoneNumber,
  bloodGroup,
  date,
  user
) {
  const names = karkunName.split(' ');
  if (names.length < 1) return null;

  const karkunId = Karkuns.insert({
    name: karkunName.trim(),
    cnicNumber: karkunCnic,
    contactNumber1: phoneNumber,
    bloodGroup,
    createdAt: date,
    createdBy: user._id,
    updatedAt: date,
    updatedBy: user._id,
  });

  return Karkuns.findOne(karkunId);
}

function processJsonRecord(jsonRecord, month, dutyId, shiftId, date, user) {
  try {
    const karkunId = jsonRecord[ID_COLUMN];
    const karkunCnic = jsonRecord[CNIC_COLUMN];
    const karkunName = jsonRecord[NAME_COLUMN];
    const phoneNumber = jsonRecord[PHONE_COLUMN];
    const bloodGroup = jsonRecord[BLOOD_GROUP_COLUMN];
    const totalCount = jsonRecord[TOTAL_COLUMN];
    const presentCount = jsonRecord[PRESENT_COLUMN];
    const absentCount = jsonRecord[ABSENT_COLUMN];

    const numTotalCount = toInteger(totalCount);
    const numPresentCount = toInteger(presentCount);
    const numAbsentCount = toInteger(absentCount);

    if (!karkunId && !karkunCnic) return;

    let karkun;
    if (karkunId) {
      karkun = Karkuns.findOne(karkunId);
    } else {
      karkun = Karkuns.findOne({
        cnicNumber: { $eq: karkunCnic },
      });

      if (!karkun) {
        karkun = createKarkun(
          karkunCnic,
          karkunName,
          phoneNumber,
          bloodGroup,
          date,
          user
        );
      }
    }

    if (!karkun) return;

    const formattedMonth = moment(month, Formats.DATE_FORMAT)
      .startOf('month')
      .format('MM-YYYY');

    // If there is already an attendance present for this karkun/month/duty/shift combination
    // then update that, otherwise insert a new one.
    const existingAttendance = Attendances.findOne({
      karkunId: karkun._id,
      dutyId,
      shiftId,
      month: formattedMonth,
    });

    if (!existingAttendance) {
      Attendances.insert({
        karkunId: karkun._id,
        dutyId,
        shiftId,
        month: formattedMonth,
        totalCount: numTotalCount,
        absentCount: numAbsentCount,
        presentCount: numPresentCount,
        percentage: round((numPresentCount / numTotalCount) * 100),
        meetingCardBarcodeId: Random.id(8),
      });
    } else {
      let meetingCardBarcodeId = existingAttendance.meetingCardBarcodeId;
      if (!meetingCardBarcodeId) {
        meetingCardBarcodeId = Random.id(8);
      }

      Attendances.update(existingAttendance._id, {
        $set: {
          totalCount: numTotalCount,
          absentCount: numAbsentCount,
          presentCount: numPresentCount,
          percentage: round((numPresentCount / numTotalCount) * 100),
          meetingCardBarcodeId,
        },
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

export function processAttendanceSheet(
  csvData,
  month,
  dutyId,
  shiftId,
  date,
  user
) {
  const lines = csvData.split('\n');
  lines.splice(0, 1);
  const updatedCsvData = lines.join('\n');

  return csv()
    .fromString(updatedCsvData)
    .then(
      Meteor.bindEnvironment(jsonData => {
        jsonData.forEach(jsonRecord => {
          processJsonRecord(jsonRecord, month, dutyId, shiftId, date, user);
        });

        return jsonData.length;
      })
    );
}
