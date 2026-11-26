import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllSecurityEventLangarDishesQuery,
  AllSecurityEventLangarDishesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_SECURITY_EVENT_LANGAR_DISHES: TypedDocumentNode<
  AllSecurityEventLangarDishesQuery,
  AllSecurityEventLangarDishesQueryVariables
> = gql`
  query allSecurityEventLangarDishes {
    allSecurityEventLangarDishes {
      _id
      name
      urduName
      overallUsedCount
    }
  }
`;

export default ALL_SECURITY_EVENT_LANGAR_DISHES;
