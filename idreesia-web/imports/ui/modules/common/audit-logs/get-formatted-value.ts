import dayjs from 'dayjs';
import { Formats } from 'meteor/idreesia-common/constants';

const fieldDisplayNamesMap: Record<string, string> = {
  name: 'Name',
  parentName: 'Parent Name',
  cnicNumber: 'CNIC',
  contactNumber1: 'Mobile No.',
  contactNumber2: 'Home No.',
  emailAddress: 'Email',
  currentAddress: 'Current Address',
  permanentAddress: 'Permanent Address',
  city: 'City',
  cityId: 'City ID',
  cityMehfilId: 'Mehfil ID',
  country: 'Country',
  bloodGroup: 'Blood Group',
  educationalQualification: 'Educational Qualification',
  meansOfEarning: 'Means of Earning',
  ehadDate: 'Ehad Date',
  birthDate: 'Birth Date',
  lastTarteebDate: 'Last Tarteeb Date',
  mehfilRaabta: 'Mehfil Raabta',
  msRaabta: 'MS Raabta',
  referenceName: 'R/O',
  attachmentId: 'Attachment ID',
  dataSource: 'Source',
};

const fieldValueFormatterMap: Record<string, (val: unknown) => string> = {
  ehadDate: val => dayjs(val as string | number | Date).format(Formats.DATE_FORMAT),
  birthDate: val => dayjs(val as string | number | Date).format(Formats.DATE_FORMAT),
  lastTarteebDate: val =>
    dayjs(val as string | number | Date).format(Formats.DATE_FORMAT),
};

// Photo changes are shown only as "Photo: updated" - never the attachment
// id or storage key, which older entries recorded. Thumbnail entries are
// folded into the photo entry and not shown.
const PhotoFields = new Set([
  'imageId',
  'sharedData.imageId',
  'sharedData.imageKey',
  'sharedData.image',
]);
const PhotoThumbnailFields = new Set([
  'sharedData.imageThumbnailId',
  'sharedData.imageThumbnailKey',
]);

/** Whether an audit value is a photo thumbnail change, which isn't shown. */
export const isHiddenAuditField = (fieldName: string) =>
  PhotoThumbnailFields.has(fieldName);

/** Whether an audit value is a photo change, shown without its values. */
export const isPhotoAuditField = (fieldName: string) =>
  PhotoFields.has(fieldName);

export default function getFormattedValue({
  fieldName,
  changedFrom,
  changedTo,
}: {
  fieldName: string;
  changedFrom: unknown;
  changedTo: unknown;
}) {
  const fieldDisplayName = fieldDisplayNamesMap[fieldName];
  const fieldValueFormatter = fieldValueFormatterMap[fieldName];

  const retVal = {
    fieldName: fieldDisplayName || fieldName,
    changedFrom: fieldValueFormatter
      ? fieldValueFormatter(changedFrom)
      : changedFrom,
    changedTo: fieldValueFormatter ? fieldValueFormatter(changedTo) : changedTo,
  };

  return retVal;
}
