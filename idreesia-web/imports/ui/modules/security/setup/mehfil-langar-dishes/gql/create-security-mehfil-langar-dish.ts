import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSecurityMehfilLangarDishMutation,
  CreateSecurityMehfilLangarDishMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SECURITY_MEHFIL_LANGAR_DISH: TypedDocumentNode<
  CreateSecurityMehfilLangarDishMutation,
  CreateSecurityMehfilLangarDishMutationVariables
> = gql`
  mutation createSecurityMehfilLangarDish($name: String!, $urduName: String!) {
    createSecurityMehfilLangarDish(name: $name, urduName: $urduName) {
      _id
      name
      urduName
    }
  }
`;

export default CREATE_SECURITY_MEHFIL_LANGAR_DISH;
