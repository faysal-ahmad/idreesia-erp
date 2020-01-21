import XLSX from 'xlsx';

import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

export function exportKarkuns(karkunIdsString) {
  const karkunIds = karkunIdsString.split(',');
  const karkuns = Karkuns.find({
    _id: { $in: karkunIds },
  }).fetch();

  let index = 1;
  const sheetData = karkuns.map(karkun => ({
    'No.': index++,
    Name: karkun.name,
    'S/O': karkun.parentName,
    CNIC: karkun.cnicNumber,
    'Mobile No.': karkun.contactNumber1,
    'Blood Group': karkun.bloodGroup,
  }));

  const ws = XLSX.utils.json_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Karkuns');
  const data = XLSX.write(wb, { type: 'buffer' });
  return Buffer.from(data);
}
