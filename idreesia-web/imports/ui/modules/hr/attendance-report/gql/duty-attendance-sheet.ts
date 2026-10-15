import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DutyAttendanceSheetQuery,
  DutyAttendanceSheetQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DUTY_ATTENDANCE_SHEET: TypedDocumentNode<
  DutyAttendanceSheetQuery,
  DutyAttendanceSheetQueryVariables
> = gql`
  query dutyAttendanceSheet(
    $month: String!
    $dutyId: String!
    $locationId: String
    $shiftId: String
  ) {
    dutyAttendanceSheet(
      month: $month
      dutyId: $dutyId
      locationId: $locationId
      shiftId: $shiftId
    ) {
      _id
      month
      karkunId
      name
      dutyId
      locationId
      shiftId
      shiftName
      daysOnDuty
      presentCount
      lateCount
      absentCount
      unmarkedCount
      percentage
      barcodeId
      karkun {
        _id
        sharedData {
          name
          imageId
          imageThumbnailId
          cnicNumber
          contactNumber1
          bloodGroup
          image {
            _id
            data
          }
        }
      }
      duty {
        _id
        name
      }
      location {
        _id
        name
      }
    }
  }
`;

export default DUTY_ATTENDANCE_SHEET;
