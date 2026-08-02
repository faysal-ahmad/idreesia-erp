import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateCityMehfilMutation,
  UpdateCityMehfilMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_CITY_MEHFIL: TypedDocumentNode<
  UpdateCityMehfilMutation,
  UpdateCityMehfilMutationVariables
> = gql`
  mutation updateCityMehfil(
    $_id: String!
    $name: String!
    $cityId: String!
    $address: String
    $mehfilStartYear: String
    $timingDetails: String
    $lcdAvailability: Boolean
    $tabAvailability: Boolean
    $otherMehfilDetails: String
  ) {
    updateCityMehfil(
      _id: $_id
      name: $name
      cityId: $cityId
      address: $address
      mehfilStartYear: $mehfilStartYear
      timingDetails: $timingDetails
      lcdAvailability: $lcdAvailability
      tabAvailability: $tabAvailability
      otherMehfilDetails: $otherMehfilDetails
    ) {
      _id
      name
      cityId
      address
      mehfilStartYear
      timingDetails
      lcdAvailability
      tabAvailability
      otherMehfilDetails
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_CITY_MEHFIL;
