import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveLocationMutation,
  RemoveLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REMOVE_LOCATION: TypedDocumentNode<
  RemoveLocationMutation,
  RemoveLocationMutationVariables
> = gql`
  mutation removeLocation($_id: String!, $physicalStoreId: String!) {
    removeLocation(_id: $_id, physicalStoreId: $physicalStoreId)
  }
`;
