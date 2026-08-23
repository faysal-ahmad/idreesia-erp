import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RunScheduledJobNowMutation,
  RunScheduledJobNowMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const RUN_SCHEDULED_JOB_NOW: TypedDocumentNode<
  RunScheduledJobNowMutation,
  RunScheduledJobNowMutationVariables
> = gql`
  mutation runScheduledJobNow($name: String!) {
    runScheduledJobNow(name: $name)
  }
`;

export default RUN_SCHEDULED_JOB_NOW;
