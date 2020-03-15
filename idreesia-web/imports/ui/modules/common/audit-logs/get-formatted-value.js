import moment from 'moment';
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
  cityId: 'City ID',
  cityMehfilId: 'Mehfil ID',
  bloodGroup: 'Blood Group',
  sharedResidenceId: 'Shared Residence ID',
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
};

const fieldValueFormatterMap = {
  ehadDate: val => moment(val).format(Formats.DATE_FORMAT),
  birthDate: val => moment(val).format(Formats.DATE_FORMAT),
  lastTarteebDate: val => moment(val).format(Formats.DATE_FORMAT),
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
