import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateDutyShiftMutation,
  CreateDutyShiftMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_DUTY_SHIFT: TypedDocumentNode<
  CreateDutyShiftMutation,
  CreateDutyShiftMutationVariables
> = gql`
  mutation createDutyShift(
    $name: String!
    $dutyId: String!
    $startTime: String
    $endTime: String
    $attendanceSheet: String
  ) {
    createDutyShift(
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
    }
  }
`;

export default CREATE_DUTY_SHIFT;
