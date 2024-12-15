import dayjs from 'dayjs';
import { Formats } from 'meteor/idreesia-common/constants';

const fieldDisplayNamesMap = {
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
  imageId: 'Image ID',
  attachmentId: 'Attachment ID',
  dataSource: 'Source',
};

const fieldValueFormatterMap = {
  ehadDate: val => dayjs(val).format(Formats.DATE_FORMAT),
  birthDate: val => dayjs(val).format(Formats.DATE_FORMAT),
  lastTarteebDate: val => dayjs(val).format(Formats.DATE_FORMAT),
};

export default function getFormattedValue({
  fieldName,
  changedFrom,
  changedTo,
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
