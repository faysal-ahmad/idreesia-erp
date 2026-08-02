import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateLastActiveTimeMutation,
  UpdateLastActiveTimeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const UPDATE_LAST_ACTIVE_TIME: TypedDocumentNode<
  UpdateLastActiveTimeMutation,
  UpdateLastActiveTimeMutationVariables
> = gql`
  mutation updateLastActiveTime {
    updateLastActiveTime
  }
`;
