import gql from 'graphql-tag';

export default gql`
type FreeFormValueType {
  name: String
  count: Int
}

type PagedFreeFormValue {
  totalResults: Int
  data: [FreeFormValueType]
}

type FreeFormCityType {
  name: String
  count: Int
  locationId: String
  locationName: String
}

type PagedFreeFormCity {
  totalResults: Int
  data: [FreeFormCityType]
}

extend type Query {
  pagedFreeFormCountries(pageIndex: Int!, pageSize: Int!): PagedFreeFormValue
    @checkPermissions(permissions: [ADMIN_MANAGE_FREE_FORM_DATA])
  pagedFreeFormCities(pageIndex: Int!, pageSize: Int!): PagedFreeFormCity
    @checkPermissions(permissions: [ADMIN_MANAGE_FREE_FORM_DATA])
}

extend type Mutation {
  renameFreeFormCity(existingSpelling: String!, newSpelling: String!): Int
    @checkPermissions(permissions: [ADMIN_MANAGE_FREE_FORM_DATA])
  renameFreeFormCountry(existingSpelling: String!, newSpelling: String!): Int
    @checkPermissions(permissions: [ADMIN_MANAGE_FREE_FORM_DATA])
  updateCityLocationMappings: Int
    @checkPermissions(permissions: [ADMIN_MANAGE_FREE_FORM_DATA])
}
`;
