import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSecurityMehfilDutyMutation,
  CreateSecurityMehfilDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SECURITY_MEHFIL_DUTY: TypedDocumentNode<
  CreateSecurityMehfilDutyMutation,
  CreateSecurityMehfilDutyMutationVariables
> = gql`
  mutation createSecurityMehfilDuty($name: String!, $urduName: String!) {
    createSecurityMehfilDuty(name: $name, urduName: $urduName) {
      _id
      name
      urduName
    }
  }
`;

export default CREATE_SECURITY_MEHFIL_DUTY;
