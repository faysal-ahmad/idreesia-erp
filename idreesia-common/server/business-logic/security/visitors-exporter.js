import XLSX from 'xlsx';

import { Visitors } from 'meteor/idreesia-common/server/collections/security';

export function exportVisitors(visitorIdsString) {
  let visitors;

  if (visitorIdsString === 'all') {
    visitors = Visitors.find().fetch();
  } else {
    const visitorIds = visitorIdsString.split(',');
    visitors = Visitors.find({
      _id: { $in: visitorIds },
    }).fetch();
  }

  let index = 1;
  const sheetData = visitors.map(visitor => ({
    'No.': index++,
    Name: visitor.name,
    'S/O': visitor.parentName,
    CNIC: visitor.cnicNumber,
    'Mobile No.': visitor.contactNumber1,
    'City/Country': `${visitor.city}, ${visitor.country}`,
  }));

  const ws = XLSX.utils.json_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Visitors');
  const data = XLSX.write(wb, { type: 'buffer' });
  return Buffer.from(data);
}
