// @ts-nocheck
import { People } from 'meteor/idreesia-common/server/collections/common';
import { createWorkbookBuffer } from 'meteor/idreesia-common/server/business-logic/common/excel-exporter';

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

  return createWorkbookBuffer(sheetData, 'Visitors');
}
