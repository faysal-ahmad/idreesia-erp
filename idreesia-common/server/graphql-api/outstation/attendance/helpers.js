import { Attendances } from 'meteor/idreesia-common/server/collections/hr';
import { keyBy } from 'meteor/idreesia-common/utilities/lodash';

export async function ensureMonthlyAttendance(karkunIds, formattedMonth, user) {
  const date = new Date();
  const existingAttendance = await Attendances.find({
    karkunId: { $in: karkunIds },
    month: formattedMonth,
  }).fetchAsync();

  const attandancesMap = keyBy(existingAttendance, 'karkunId');
  const missingAttendances = [];

  karkunIds.forEach(karkunId => {
    if (!attandancesMap[karkunId]) {
      missingAttendances.push({
        insertOne: {
          karkunId,
          month: formattedMonth,
          totalCount: 0,
          absentCount: 0,
          presentCount: 0,
          percentage: 0,
          createdAt: date,
          createdBy: user._id,
        },
      });
    }
  });

  if (missingAttendances.length > 0) {
    await Attendances.rawCollection().bulkWrite(missingAttendances);
  }
}
