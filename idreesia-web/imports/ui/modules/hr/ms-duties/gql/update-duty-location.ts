import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateDutyLocationMutation,
  UpdateDutyLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_DUTY_LOCATION: TypedDocumentNode<
  UpdateDutyLocationMutation,
  UpdateDutyLocationMutationVariables
> = gql`
  mutation updateDutyLocation($id: String!, $name: String!, $dutyId: String!) {
    updateDutyLocation(id: $id, name: $name, dutyId: $dutyId) {
      _id
      name
      dutyId
    }
  }
`;

export default UPDATE_DUTY_LOCATION;
