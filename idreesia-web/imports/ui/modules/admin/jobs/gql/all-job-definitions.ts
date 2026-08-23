import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllJobDefinitionsQuery,
  AllJobDefinitionsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_JOB_DEFINITIONS: TypedDocumentNode<
  AllJobDefinitionsQuery,
  AllJobDefinitionsQueryVariables
> = gql`
  query allJobDefinitions {
    allJobDefinitions {
      _id
      name
      displayName
      defaultSchedule
      schedule
      enabled
      createdAt
      updatedAt
    }
  }
`;

export default ALL_JOB_DEFINITIONS;
