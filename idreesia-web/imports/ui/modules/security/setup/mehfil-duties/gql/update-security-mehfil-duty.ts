import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityMehfilDutyMutation,
  UpdateSecurityMehfilDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_MEHFIL_DUTY: TypedDocumentNode<
  UpdateSecurityMehfilDutyMutation,
  UpdateSecurityMehfilDutyMutationVariables
> = gql`
  mutation updateSecurityMehfilDuty($id: String!, $name: String!, $urduName: String!) {
    updateSecurityMehfilDuty(id: $id, name: $name, urduName: $urduName) {
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

export default UPDATE_SECURITY_MEHFIL_DUTY;
