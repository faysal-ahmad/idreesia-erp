import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetJobDefinitionEnabledMutation,
  SetJobDefinitionEnabledMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_JOB_DEFINITION_ENABLED: TypedDocumentNode<
  SetJobDefinitionEnabledMutation,
  SetJobDefinitionEnabledMutationVariables
> = gql`
  mutation setJobDefinitionEnabled($_id: String!, $enabled: Boolean!) {
    setJobDefinitionEnabled(_id: $_id, enabled: $enabled) {
      _id
      enabled
      updatedAt
    }
  }
`;

export default SET_JOB_DEFINITION_ENABLED;
