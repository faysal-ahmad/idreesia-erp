import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveCityMehfilMutation,
  RemoveCityMehfilMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_CITY_MEHFIL: TypedDocumentNode<
  RemoveCityMehfilMutation,
  RemoveCityMehfilMutationVariables
> = gql`
  mutation removeCityMehfil($_id: String!) {
    removeCityMehfil(_id: $_id)
  }
`;

export default REMOVE_CITY_MEHFIL;
