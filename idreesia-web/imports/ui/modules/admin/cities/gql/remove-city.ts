import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveCityMutation,
  RemoveCityMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_CITY: TypedDocumentNode<
  RemoveCityMutation,
  RemoveCityMutationVariables
> = gql`
  mutation removeCity($_id: String!) {
    removeCity(_id: $_id)
  }
`;

export default REMOVE_CITY;
