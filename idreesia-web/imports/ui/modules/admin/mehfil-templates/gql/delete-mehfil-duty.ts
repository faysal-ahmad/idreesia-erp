import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteMehfilDutyMutation,
  DeleteMehfilDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_MEHFIL_DUTY: TypedDocumentNode<
  DeleteMehfilDutyMutation,
  DeleteMehfilDutyMutationVariables
> = gql`
  mutation deleteMehfilDuty($_id: String!) {
    deleteMehfilDuty(_id: $_id)
  }
`;

export default DELETE_MEHFIL_DUTY;
