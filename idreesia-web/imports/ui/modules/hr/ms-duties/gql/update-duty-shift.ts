import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateDutyShiftMutation,
  UpdateDutyShiftMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_DUTY_SHIFT: TypedDocumentNode<
  UpdateDutyShiftMutation,
  UpdateDutyShiftMutationVariables
> = gql`
  mutation updateDutyShift(
    $_id: String!
    $name: String!
    $dutyId: String!
    $startTime: String
    $endTime: String
    $attendanceSheet: String
  ) {
    updateDutyShift(
      _id: $_id
      name: $name
      dutyId: $dutyId
      startTime: $startTime
      endTime: $endTime
      attendanceSheet: $attendanceSheet
    ) {
      _id
      name
      dutyId
      startTime
      endTime
      attendanceSheet
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_DUTY_SHIFT;
