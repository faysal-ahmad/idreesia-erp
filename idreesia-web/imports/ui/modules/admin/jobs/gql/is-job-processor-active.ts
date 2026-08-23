import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  IsJobProcessorActiveQuery,
  IsJobProcessorActiveQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const IS_JOB_PROCESSOR_ACTIVE: TypedDocumentNode<
  IsJobProcessorActiveQuery,
  IsJobProcessorActiveQueryVariables
> = gql`
  query isJobProcessorActive {
    isJobProcessorActive
  }
`;

export default IS_JOB_PROCESSOR_ACTIVE;
