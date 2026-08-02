import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CityByIdQuery,
  CityByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CITY_BY_ID: TypedDocumentNode<
  CityByIdQuery,
  CityByIdQueryVariables
> = gql`
  query cityById($_id: String!) {
    cityById(_id: $_id) {
      _id
      name
      peripheryOf
      country
      region
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default CITY_BY_ID;
