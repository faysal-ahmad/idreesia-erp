import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateKarkunDutyMutation,
  CreateKarkunDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_KARKUN_DUTY: TypedDocumentNode<
  CreateKarkunDutyMutation,
  CreateKarkunDutyMutationVariables
> = gql`
  mutation createKarkunDuty(
    $karkunId: String!
    $dutyId: String!
    $shiftId: String
    $locationId: String
    $role: String
    $daysOfWeek: [String]
  ) {
    createKarkunDuty(
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

export default CREATE_KARKUN_DUTY;
