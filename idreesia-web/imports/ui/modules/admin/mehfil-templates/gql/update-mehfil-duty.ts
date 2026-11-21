import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateMehfilDutyMutation,
  UpdateMehfilDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_MEHFIL_DUTY: TypedDocumentNode<
  UpdateMehfilDutyMutation,
  UpdateMehfilDutyMutationVariables
> = gql`
  mutation updateMehfilDuty(
    $_id: String!
    $name: String
    $description: String
  ) {
    updateMehfilDuty(_id: $_id, name: $name, description: $description) {
      _id
    }
  }
`;

export default UPDATE_MEHFIL_DUTY;
