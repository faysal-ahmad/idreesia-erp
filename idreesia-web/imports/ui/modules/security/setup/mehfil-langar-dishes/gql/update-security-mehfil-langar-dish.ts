import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityMehfilLangarDishMutation,
  UpdateSecurityMehfilLangarDishMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_MEHFIL_LANGAR_DISH: TypedDocumentNode<
  UpdateSecurityMehfilLangarDishMutation,
  UpdateSecurityMehfilLangarDishMutationVariables
> = gql`
  mutation updateSecurityMehfilLangarDish($id: String!, $name: String!, $urduName: String!) {
    updateSecurityMehfilLangarDish(id: $id, name: $name, urduName: $urduName) {
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

export default UPDATE_SECURITY_MEHFIL_LANGAR_DISH;
