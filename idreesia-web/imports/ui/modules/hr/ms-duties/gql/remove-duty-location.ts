import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveDutyLocationMutation,
  RemoveDutyLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_DUTY_LOCATION: TypedDocumentNode<
  RemoveDutyLocationMutation,
  RemoveDutyLocationMutationVariables
> = gql`
  mutation removeDutyLocation($_id: String!) {
    removeDutyLocation(_id: $_id)
  }
`;

export default REMOVE_DUTY_LOCATION;
