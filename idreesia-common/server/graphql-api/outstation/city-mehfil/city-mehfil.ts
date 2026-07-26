// @ts-nocheck
import gql from 'graphql-tag';

export default gql`
type CityMehfilType {
  _id: String
  cityId: String
  name: String
  address: String
  mehfilStartYear: String
  timingDetails: String
  lcdAvailability: Boolean
  tabAvailability: Boolean
  otherMehfilDetails: String

  karkunCount: Int

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  allCityMehfils: [CityMehfilType]
  cityMehfilsByCityId(cityId: String!): [CityMehfilType]
  cityMehfilById(_id: String!): CityMehfilType
}

extend type Mutation {
  createCityMehfil(
    name: String!
    cityId: String!
    address: String
    mehfilStartYear: String
    timingDetails: String
    lcdAvailability: Boolean
    tabAvailability: Boolean
    otherMehfilDetails: String
  ): CityMehfilType
  @checkPermissions(permissions: [ADMIN_MANAGE_CITIES])

  updateCityMehfil(
    _id: String!
    name: String!
    cityId: String!
    address: String
    mehfilStartYear: String
    timingDetails: String
    lcdAvailability: Boolean
    tabAvailability: Boolean
    otherMehfilDetails: String
  ): CityMehfilType
  @checkPermissions(permissions: [ADMIN_MANAGE_CITIES])

  removeCityMehfil(_id: String!): Int
  @checkPermissions(permissions: [ADMIN_MANAGE_CITIES])
}
`;
