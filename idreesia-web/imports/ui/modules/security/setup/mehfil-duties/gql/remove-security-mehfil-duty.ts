import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityMehfilDutyMutation,
  RemoveSecurityMehfilDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_MEHFIL_DUTY: TypedDocumentNode<
  RemoveSecurityMehfilDutyMutation,
  RemoveSecurityMehfilDutyMutationVariables
> = gql`
  mutation removeSecurityMehfilDuty($_id: String!) {
    removeSecurityMehfilDuty(_id: $_id)
  }
`;

export default REMOVE_SECURITY_MEHFIL_DUTY;
