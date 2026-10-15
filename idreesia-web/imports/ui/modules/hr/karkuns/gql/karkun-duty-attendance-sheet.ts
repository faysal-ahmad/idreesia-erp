import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  KarkunDutyAttendanceSheetQuery,
  KarkunDutyAttendanceSheetQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const KARKUN_DUTY_ATTENDANCE_SHEET: TypedDocumentNode<
  KarkunDutyAttendanceSheetQuery,
  KarkunDutyAttendanceSheetQueryVariables
> = gql`
  query karkunDutyAttendanceSheet($karkunId: String!) {
    karkunDutyAttendanceSheet(karkunId: $karkunId) {
      _id
      month
      shiftName
      daysOnDuty
      presentCount
      lateCount
      absentCount
      unmarkedCount
      percentage
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

export default KARKUN_DUTY_ATTENDANCE_SHEET;
