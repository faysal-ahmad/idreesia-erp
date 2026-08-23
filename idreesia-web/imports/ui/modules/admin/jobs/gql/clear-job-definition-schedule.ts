import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ClearJobDefinitionScheduleMutation,
  ClearJobDefinitionScheduleMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CLEAR_JOB_DEFINITION_SCHEDULE: TypedDocumentNode<
  ClearJobDefinitionScheduleMutation,
  ClearJobDefinitionScheduleMutationVariables
> = gql`
  mutation clearJobDefinitionSchedule($_id: String!) {
    clearJobDefinitionSchedule(_id: $_id) {
      _id
      schedule
      updatedAt
    }
  }
`;

export default CLEAR_JOB_DEFINITION_SCHEDULE;
