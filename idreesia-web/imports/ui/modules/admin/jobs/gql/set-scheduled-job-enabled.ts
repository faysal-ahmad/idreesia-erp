import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetScheduledJobEnabledMutation,
  SetScheduledJobEnabledMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_SCHEDULED_JOB_ENABLED: TypedDocumentNode<
  SetScheduledJobEnabledMutation,
  SetScheduledJobEnabledMutationVariables
> = gql`
  mutation setScheduledJobEnabled($_id: String!, $enabled: Boolean!) {
    setScheduledJobEnabled(_id: $_id, enabled: $enabled)
  }
`;

export default SET_SCHEDULED_JOB_ENABLED;
