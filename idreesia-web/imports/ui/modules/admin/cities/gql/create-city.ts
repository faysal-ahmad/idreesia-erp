import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateCityMutation,
  CreateCityMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_CITY: TypedDocumentNode<
  CreateCityMutation,
  CreateCityMutationVariables
> = gql`
  mutation createCity(
    $name: String!
    $peripheryOf: String
    $country: String!
    $region: String
  ) {
    createCity(
      name: $name
      peripheryOf: $peripheryOf
      country: $country
      region: $region
    ) {
      _id
      name
      peripheryOf
      region
      country
    }
  }
`;

export default CREATE_CITY;
