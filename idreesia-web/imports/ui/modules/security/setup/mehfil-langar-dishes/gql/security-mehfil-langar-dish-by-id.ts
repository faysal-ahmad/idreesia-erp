import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityMehfilLangarDishByIdQuery,
  SecurityMehfilLangarDishByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_MEHFIL_LANGAR_DISH_BY_ID: TypedDocumentNode<
  SecurityMehfilLangarDishByIdQuery,
  SecurityMehfilLangarDishByIdQueryVariables
> = gql`
  query securityMehfilLangarDishById($id: String!) {
    securityMehfilLangarDishById(id: $id) {
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

export default SECURITY_MEHFIL_LANGAR_DISH_BY_ID;
