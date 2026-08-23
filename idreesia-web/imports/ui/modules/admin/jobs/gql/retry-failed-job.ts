import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RetryFailedJobMutation,
  RetryFailedJobMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const RETRY_FAILED_JOB: TypedDocumentNode<
  RetryFailedJobMutation,
  RetryFailedJobMutationVariables
> = gql`
  mutation retryFailedJob($_id: String!) {
    retryFailedJob(_id: $_id)
  }
`;

export default RETRY_FAILED_JOB;
