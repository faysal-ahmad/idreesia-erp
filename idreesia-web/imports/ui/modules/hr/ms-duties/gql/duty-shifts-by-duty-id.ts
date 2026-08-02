import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DutyShiftsByDutyIdQuery,
  DutyShiftsByDutyIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DUTY_SHIFTS_BY_DUTY_ID: TypedDocumentNode<
  DutyShiftsByDutyIdQuery,
  DutyShiftsByDutyIdQueryVariables
> = gql`
  query dutyShiftsByDutyId($dutyId: String!) {
    dutyShiftsByDutyId(dutyId: $dutyId) {
      _id
      dutyId
      name
      startTime
      endTime
      attendanceSheet
      canDelete
    }
  }
`;

export default DUTY_SHIFTS_BY_DUTY_ID;
