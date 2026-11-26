import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityEventDutyMutation,
  RemoveSecurityEventDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_EVENT_DUTY: TypedDocumentNode<
  RemoveSecurityEventDutyMutation,
  RemoveSecurityEventDutyMutationVariables
> = gql`
  mutation removeSecurityEventDuty($_id: String!) {
    removeSecurityEventDuty(_id: $_id)
  }
`;

export default REMOVE_SECURITY_EVENT_DUTY;
