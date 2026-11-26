import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityEventLangarDishByIdQuery,
  SecurityEventLangarDishByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_EVENT_LANGAR_DISH_BY_ID: TypedDocumentNode<
  SecurityEventLangarDishByIdQuery,
  SecurityEventLangarDishByIdQueryVariables
> = gql`
  query securityEventLangarDishById($id: String!) {
    securityEventLangarDishById(id: $id) {
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

export default SECURITY_EVENT_LANGAR_DISH_BY_ID;
