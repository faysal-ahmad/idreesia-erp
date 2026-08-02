import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateKarkunDutyMutation,
  UpdateKarkunDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_KARKUN_DUTY: TypedDocumentNode<
  UpdateKarkunDutyMutation,
  UpdateKarkunDutyMutationVariables
> = gql`
  mutation updateKarkunDuty(
    $_id: String!
    $karkunId: String!
    $dutyId: String!
    $shiftId: String
    $locationId: String
    $role: String
    $daysOfWeek: [String]
  ) {
    updateKarkunDuty(
      _id: $_id
      karkunId: $karkunId
      dutyId: $dutyId
      shiftId: $shiftId
      locationId: $locationId
      role: $role
      daysOfWeek: $daysOfWeek
    ) {
      _id
      dutyId
      dutyName
      shiftId
      shiftName
      locationId
      locationName
      role
      daysOfWeek
    }
  }
`;

export default UPDATE_KARKUN_DUTY;
