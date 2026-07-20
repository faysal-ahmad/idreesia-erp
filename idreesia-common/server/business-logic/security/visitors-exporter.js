import XLSX from 'xlsx';

import { People } from 'meteor/idreesia-common/server/collections/common';

export async function exportVisitors(visitorIdsString) {
  let people;

  if (visitorIdsString === 'all') {
    people = await People.find({ isVisitor: true }).fetchAsync();
  } else {
    const visitorIds = visitorIdsString.split(',');
    people = await People.find({
      _id: { $in: visitorIds },
      isVisitor: true,
    }).fetchAsync();
  }

  let index = 1;
  const sheetData = people.map(person => ({
    'No.': index++,
    Name: person.sharedData.name,
    'S/O': person.sharedData.parentName,
    CNIC: person.sharedData.cnicNumber,
    'Mobile No.': person.sharedData.contactNumber1,
    'City/Country': `${person.visitorData?.city}, ${person.visitorData?.country}`,
  }));

  const ws = XLSX.utils.json_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Visitors');
  const data = XLSX.write(wb, { type: 'buffer' });
  return Buffer.from(data);
}
