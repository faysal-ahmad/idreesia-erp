import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ResetJobDefinitionScheduleMutation,
  ResetJobDefinitionScheduleMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const RESET_JOB_DEFINITION_SCHEDULE: TypedDocumentNode<
  ResetJobDefinitionScheduleMutation,
  ResetJobDefinitionScheduleMutationVariables
> = gql`
  mutation resetJobDefinitionSchedule($_id: String!) {
    resetJobDefinitionSchedule(_id: $_id) {
      _id
      schedule
      updatedAt
    }
  }
`;

export default RESET_JOB_DEFINITION_SCHEDULE;
