import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateDutyLocationMutation,
  CreateDutyLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_DUTY_LOCATION: TypedDocumentNode<
  CreateDutyLocationMutation,
  CreateDutyLocationMutationVariables
> = gql`
  mutation createDutyLocation($name: String!, $dutyId: String!) {
    createDutyLocation(name: $name, dutyId: $dutyId) {
      _id
      name
      dutyId
    }
  }
`;

export default CREATE_DUTY_LOCATION;
