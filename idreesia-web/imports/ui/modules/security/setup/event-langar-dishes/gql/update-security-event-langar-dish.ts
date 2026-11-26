import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityEventLangarDishMutation,
  UpdateSecurityEventLangarDishMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_EVENT_LANGAR_DISH: TypedDocumentNode<
  UpdateSecurityEventLangarDishMutation,
  UpdateSecurityEventLangarDishMutationVariables
> = gql`
  mutation updateSecurityEventLangarDish($id: String!, $name: String!, $urduName: String!) {
    updateSecurityEventLangarDish(id: $id, name: $name, urduName: $urduName) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_SECURITY_EVENT_LANGAR_DISH;
