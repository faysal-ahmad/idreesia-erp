import gql from 'graphql-tag';

export default gql`
input PersonSharedDataInput {
  name: String!
  parentName: String!
  cnicNumber: String
  ehadDate: String!
  birthDate: String
  referenceName: String!
  contactNumber1: String
  contactNumber2: String
  currentAddress: String
  permanentAddress: String
  educationalQualification: String
  meansOfEarning: String
  tagIds: [String]
}

input PersonVisitorDataInput {
  city: String
  country: String
  criminalRecord: String
  otherNotes: String
}

extend type Query {
  pagedSecurityPeople(filter: PersonFilter): PagedPeopleType
    @checkPermissions(permissions: [SECURITY_VIEW_VISITORS, SECURITY_MANAGE_VISITORS])

  securityPersonById(_id: String!): PersonType
    @checkPermissions(permissions: [SECURITY_VIEW_VISITORS, SECURITY_MANAGE_VISITORS])

  securityPersonByCnic(cnicNumbers: [String]!): PersonType
    @checkPermissions(permissions: [SECURITY_VIEW_VISITORS, SECURITY_MANAGE_VISITORS])
}

extend type Mutation {
  createSecurityVisitorPerson(
    sharedData: PersonSharedDataInput!
    visitorData: PersonVisitorDataInput
  ): PersonType @checkPermissions(permissions: [SECURITY_MANAGE_VISITORS])

  updateSecurityVisitorPerson(
    _id: String!
    sharedData: PersonSharedDataInput!
    visitorData: PersonVisitorDataInput
  ): PersonType @checkPermissions(permissions: [SECURITY_MANAGE_VISITORS])

  updateSecurityPersonVisitorData(
    _id: String!
    criminalRecord: String
    otherNotes: String
  ): PersonType @checkPermissions(permissions: [SECURITY_MANAGE_VISITORS])

  deleteSecurityPerson(_id: String!): Int
    @checkPermissions(permissions: [SECURITY_DELETE_DATA])

  setSecurityPersonImage(_id: String!, imageId: String!): PersonType
    @checkPermissions(permissions: [SECURITY_MANAGE_VISITORS])

  importSecurityVisitorsCsvData(csvData: String!): String
    @checkPermissions(permissions: [SECURITY_MANAGE_VISITORS])
}
`;
