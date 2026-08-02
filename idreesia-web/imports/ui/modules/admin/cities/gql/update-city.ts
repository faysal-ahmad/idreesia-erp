import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateCityMutation,
  UpdateCityMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_CITY: TypedDocumentNode<
  UpdateCityMutation,
  UpdateCityMutationVariables
> = gql`
  mutation updateCity(
    $_id: String!
    $name: String!
    $peripheryOf: String
    $country: String!
    $region: String
  ) {
    updateCity(
      _id: $_id
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
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_CITY;
