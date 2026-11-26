import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSecurityEventLangarDishMutation,
  CreateSecurityEventLangarDishMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SECURITY_EVENT_LANGAR_DISH: TypedDocumentNode<
  CreateSecurityEventLangarDishMutation,
  CreateSecurityEventLangarDishMutationVariables
> = gql`
  mutation createSecurityEventLangarDish($name: String!, $urduName: String!) {
    createSecurityEventLangarDish(name: $name, urduName: $urduName) {
      _id
      name
      urduName
    }
  }
`;

export default CREATE_SECURITY_EVENT_LANGAR_DISH;
