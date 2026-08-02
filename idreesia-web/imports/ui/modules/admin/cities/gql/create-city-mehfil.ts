import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateCityMehfilMutation,
  CreateCityMehfilMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_CITY_MEHFIL: TypedDocumentNode<
  CreateCityMehfilMutation,
  CreateCityMehfilMutationVariables
> = gql`
  mutation createCityMehfil(
    $name: String!
    $cityId: String!
    $address: String
    $mehfilStartYear: String
    $timingDetails: String
    $lcdAvailability: Boolean
    $tabAvailability: Boolean
    $otherMehfilDetails: String
  ) {
    createCityMehfil(
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
    }
  }
`;

export default CREATE_CITY_MEHFIL;
