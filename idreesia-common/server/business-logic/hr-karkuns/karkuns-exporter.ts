import { People } from 'meteor/idreesia-common/server/collections/common';
import { createWorkbookBuffer } from 'meteor/idreesia-common/server/business-logic/common/excel-exporter';

import { HR_KARKUN_SELECTOR } from '../hr-common/hr-person-roles';

/** The requested karkuns as a sheet. Ids of people who aren't karkuns are skipped. */
export async function exportKarkuns(karkunIdsString: string) {
  const karkunIds = karkunIdsString.split(',');
  const people = await People.find({
    _id: { $in: karkunIds },
    ...HR_KARKUN_SELECTOR,
  }).fetchAsync();

  let index = 1;
  const sheetData = people.map((person: any) => ({
    'No.': index++,
    Name: person.sharedData.name,
    'S/O': person.sharedData.parentName,
    CNIC: person.sharedData.cnicNumber,
    'Mobile No.': person.sharedData.contactNumber1,
    'Blood Group': person.sharedData.bloodGroup,
  }));

  return createWorkbookBuffer(sheetData, 'Karkuns');
}
