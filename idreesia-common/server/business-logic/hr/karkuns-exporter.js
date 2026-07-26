import { People } from 'meteor/idreesia-common/server/collections/common';
import { createWorkbookBuffer } from 'meteor/idreesia-common/server/business-logic/common/excel-exporter';

export async function exportKarkuns(karkunIdsString) {
  const karkunIds = karkunIdsString.split(',');
  const people = await People.find({
    _id: { $in: karkunIds },
  }).fetchAsync();

  let index = 1;
  const sheetData = people.map(person => ({
    'No.': index++,
    Name: person.sharedData.name,
    'S/O': person.sharedData.parentName,
    CNIC: person.sharedData.cnicNumber,
    'Mobile No.': person.sharedData.contactNumber1,
    'Blood Group': person.sharedData.bloodGroup,
  }));

  return createWorkbookBuffer(sheetData, 'Karkuns');
}
