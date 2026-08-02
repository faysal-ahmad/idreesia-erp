import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CityMehfilsByCityIdQuery,
  CityMehfilsByCityIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CITY_MEHFILS_BY_CITY_ID: TypedDocumentNode<
  CityMehfilsByCityIdQuery,
  CityMehfilsByCityIdQueryVariables
> = gql`
  query cityMehfilsByCityId($cityId: String!) {
    cityMehfilsByCityId(cityId: $cityId) {
      _id
      cityId
      name
      address
      karkunCount
      mehfilStartYear
      timingDetails
      lcdAvailability
      tabAvailability
      otherMehfilDetails
    }
  }
`;

export default CITY_MEHFILS_BY_CITY_ID;
