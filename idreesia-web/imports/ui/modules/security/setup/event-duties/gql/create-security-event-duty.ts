import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSecurityEventDutyMutation,
  CreateSecurityEventDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SECURITY_EVENT_DUTY: TypedDocumentNode<
  CreateSecurityEventDutyMutation,
  CreateSecurityEventDutyMutationVariables
> = gql`
  mutation createSecurityEventDuty($name: String!, $urduName: String!) {
    createSecurityEventDuty(name: $name, urduName: $urduName) {
      _id
      name
      urduName
    }
  }
`;

export default CREATE_SECURITY_EVENT_DUTY;
