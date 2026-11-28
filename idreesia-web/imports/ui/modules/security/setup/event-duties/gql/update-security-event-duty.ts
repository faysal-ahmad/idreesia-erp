import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityEventDutyMutation,
  UpdateSecurityEventDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_EVENT_DUTY: TypedDocumentNode<
  UpdateSecurityEventDutyMutation,
  UpdateSecurityEventDutyMutationVariables
> = gql`
  mutation updateSecurityEventDuty($id: String!, $name: String!, $urduName: String!) {
    updateSecurityEventDuty(id: $id, name: $name, urduName: $urduName) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_SECURITY_EVENT_DUTY;
