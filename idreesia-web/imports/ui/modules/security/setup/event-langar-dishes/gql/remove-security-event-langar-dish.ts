import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityEventLangarDishMutation,
  RemoveSecurityEventLangarDishMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_EVENT_LANGAR_DISH: TypedDocumentNode<
  RemoveSecurityEventLangarDishMutation,
  RemoveSecurityEventLangarDishMutationVariables
> = gql`
  mutation removeSecurityEventLangarDish($_id: String!) {
    removeSecurityEventLangarDish(_id: $_id)
  }
`;

export default REMOVE_SECURITY_EVENT_LANGAR_DISH;
