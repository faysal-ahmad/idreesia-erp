import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllSecurityMehfilLangarDishesQuery,
  AllSecurityMehfilLangarDishesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_SECURITY_MEHFIL_LANGAR_DISHES: TypedDocumentNode<
  AllSecurityMehfilLangarDishesQuery,
  AllSecurityMehfilLangarDishesQueryVariables
> = gql`
  query allSecurityMehfilLangarDishes {
    allSecurityMehfilLangarDishes {
      _id
      name
      urduName
      overallUsedCount
    }
  }
`;

export default ALL_SECURITY_MEHFIL_LANGAR_DISHES;
