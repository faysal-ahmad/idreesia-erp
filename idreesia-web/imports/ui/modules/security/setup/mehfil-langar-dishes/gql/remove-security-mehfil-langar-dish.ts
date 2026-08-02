import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityMehfilLangarDishMutation,
  RemoveSecurityMehfilLangarDishMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_MEHFIL_LANGAR_DISH: TypedDocumentNode<
  RemoveSecurityMehfilLangarDishMutation,
  RemoveSecurityMehfilLangarDishMutationVariables
> = gql`
  mutation removeSecurityMehfilLangarDish($_id: String!) {
    removeSecurityMehfilLangarDish(_id: $_id)
  }
`;

export default REMOVE_SECURITY_MEHFIL_LANGAR_DISH;
