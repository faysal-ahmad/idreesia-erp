import XLSX from 'xlsx';
import { People } from 'meteor/idreesia-common/server/collections/common';

export function exportKarkuns(karkunIdsString) {
  const karkunIds = karkunIdsString.split(',');
  const people = People.find({
    _id: { $in: karkunIds },
  }).fetch();

  let index = 1;
  const sheetData = people.map(person => ({
    'No.': index++,
    Name: person.sharedData.name,
    'S/O': person.sharedData.parentName,
    CNIC: person.sharedData.cnicNumber,
    'Mobile No.': person.sharedData.contactNumber1,
    'Blood Group': person.sharedData.bloodGroup,
  }));

  const ws = XLSX.utils.json_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Karkuns');
  const data = XLSX.write(wb, { type: 'buffer' });
  return Buffer.from(data);
}
