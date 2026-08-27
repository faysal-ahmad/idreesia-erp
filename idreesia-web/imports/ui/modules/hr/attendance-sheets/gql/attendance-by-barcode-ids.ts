import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AttendanceByBarcodeIdsQuery,
  AttendanceByBarcodeIdsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ATTENDANCE_BY_BARCODE_IDS: TypedDocumentNode<
  AttendanceByBarcodeIdsQuery,
  AttendanceByBarcodeIdsQueryVariables
> = gql`
  query attendanceByBarcodeIds($barcodeIds: String!) {
    attendanceByBarcodeIds(barcodeIds: $barcodeIds) {
      _id
      karkunId
      month
      dutyId
      shiftId
      absentCount
      presentCount
      percentage
      meetingCardBarcodeId
      karkun {
        _id
        sharedData {
          name
          bloodGroup
          contactNumber1Subscribed
          contactNumber2Subscribed
          image {
            _id
            data
          }
        }
      }
      job {
        _id
        name
      }
      duty {
        _id
        name
      }
      shift {
        _id
        name
      }
    }
  }
`;

export default ATTENDANCE_BY_BARCODE_IDS;
