import csv from "csvtojson";
import moment from "moment";
import { toInteger, round } from "lodash";

import { Attendances, Karkuns } from "meteor/idreesia-common/collections/hr";

const ID_COLUMN = "ID (Programing Codes)";
const PRESENT_COLUMN = "P";
const ABSENT_COLUMN = "A";
const TOTAL_COLUMN = "Day";

function processJsonRecord(jsonRecord, month, dutyId, shiftId) {
  try {
    const karkunId = jsonRecord[ID_COLUMN];
    const totalCount = jsonRecord[TOTAL_COLUMN];
    const presentCount = jsonRecord[PRESENT_COLUMN];
    const absentCount = jsonRecord[ABSENT_COLUMN];

    const numTotalCount = toInteger(totalCount);
    const numPresentCount = toInteger(presentCount);
    const numAbsentCount = toInteger(absentCount);

    if (!karkunId) return;
    // Verify that this karkun exists
    const karkun = Karkuns.findOne(karkunId);
    if (!karkun) return;

    Attendances.insert({
      karkunId,
      dutyId,
      shiftId,
      month: moment(month)
        .startOf("month")
        .format("MM-YYYY"),
      absentCount: numAbsentCount,
      presentCount: numPresentCount,
      percentage: round(numPresentCount / numTotalCount * 100),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

export function processAttendanceSheet(csvData, month, dutyId, shiftId) {
  const lines = csvData.split("\n");
  lines.splice(0, 1);
  const updatedCsvData = lines.join("\n");

  return csv()
    .fromString(updatedCsvData)
    .then(
      Meteor.bindEnvironment(jsonData => {
        jsonData.forEach(jsonRecord => {
          processJsonRecord(jsonRecord, month, dutyId, shiftId);
        });

        return jsonData.length;
      })
    );
}
