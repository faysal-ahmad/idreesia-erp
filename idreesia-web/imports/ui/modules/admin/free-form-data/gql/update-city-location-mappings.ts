import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateCityLocationMappingsMutation,
  UpdateCityLocationMappingsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_CITY_LOCATION_MAPPINGS: TypedDocumentNode<
  UpdateCityLocationMappingsMutation,
  UpdateCityLocationMappingsMutationVariables
> = gql`
  mutation updateCityLocationMappings {
    updateCityLocationMappings
  }
`;

export default UPDATE_CITY_LOCATION_MAPPINGS;
