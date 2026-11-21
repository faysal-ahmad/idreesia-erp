import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateMehfilDutyMutation,
  CreateMehfilDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_MEHFIL_DUTY: TypedDocumentNode<
  CreateMehfilDutyMutation,
  CreateMehfilDutyMutationVariables
> = gql`
  mutation createMehfilDuty($name: String!, $description: String) {
    createMehfilDuty(name: $name, description: $description) {
      _id
    }
  }
`;

export default CREATE_MEHFIL_DUTY;
