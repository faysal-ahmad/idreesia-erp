import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DutyAttendanceCardsQuery,
  DutyAttendanceCardsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DUTY_ATTENDANCE_CARDS: TypedDocumentNode<
  DutyAttendanceCardsQuery,
  DutyAttendanceCardsQueryVariables
> = gql`
  query dutyAttendanceCards(
    $month: String!
    $dutyId: String!
    $locationId: String
    $shiftId: String
    $karkunIds: [String!]!
  ) {
    dutyAttendanceCards(
      month: $month
      dutyId: $dutyId
      locationId: $locationId
      shiftId: $shiftId
      karkunIds: $karkunIds
    ) {
      _id
      karkunId
      name
      shiftNames
      percentage
      barcodeId
      karkun {
        _id
        sharedData {
          name
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
    }
  }
`;

export default DUTY_ATTENDANCE_CARDS;
