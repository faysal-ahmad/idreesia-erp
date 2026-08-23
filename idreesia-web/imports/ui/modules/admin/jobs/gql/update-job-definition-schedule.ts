import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateJobDefinitionScheduleMutation,
  UpdateJobDefinitionScheduleMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_JOB_DEFINITION_SCHEDULE: TypedDocumentNode<
  UpdateJobDefinitionScheduleMutation,
  UpdateJobDefinitionScheduleMutationVariables
> = gql`
  mutation updateJobDefinitionSchedule($_id: String!, $schedule: String!) {
    updateJobDefinitionSchedule(_id: $_id, schedule: $schedule) {
      _id
      schedule
      updatedAt
    }
  }
`;

export default UPDATE_JOB_DEFINITION_SCHEDULE;
