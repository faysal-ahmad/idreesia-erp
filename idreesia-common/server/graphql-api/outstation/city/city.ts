// @ts-nocheck
import gql from 'graphql-tag';

export default gql`
type CityType {
  _id: String
  name: String
  peripheryOf: String
  country: String
  region: String

  karkunCount: Int
  memberCount: Int
  mehfils: [CityMehfilType]
  peripheryOfCity: CityType

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedCityType {
  totalResults: Int
  data: [CityType]
}

input CityFilter {
  peripheryOf: String
  region: String
  pageIndex: String
  pageSize: String
}

extend type Query {
  allCities: [CityType]
  pagedCities(filter: CityFilter): PagedCityType
  cityById(_id: String!): CityType

  distinctRegions: [String]
}

extend type Mutation {
  createCity(name: String!, peripheryOf: String, country: String!, region: String): CityType
  @checkPermissions(permissions: [ADMIN_MANAGE_CITIES])

  updateCity(_id: String!, peripheryOf: String, name: String!, country: String!, region: String): CityType
  @checkPermissions(permissions: [ADMIN_MANAGE_CITIES])

  removeCity(_id: String!): Int
  @checkPermissions(permissions: [ADMIN_MANAGE_CITIES])
}
`;
