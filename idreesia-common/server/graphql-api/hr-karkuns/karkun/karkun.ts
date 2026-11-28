import gql from 'graphql-tag';

export default gql`
# Karkun management. Gated by the karkun permissions only, and each operation
# reaches karkuns only (isKarkun). Employment details are not part of
# PersonType; employee management has its own operations in hr/employee.
extend type Query {
  hrCommitteeOptions: [CommitteeType]
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS_SETUP_DATA])

  hrKarkunById(_id: String!): PersonType
  @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS])

  hrKarkunsById(_ids: String!): [PersonType]
  @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS])

  # Karkuns of Multan, to add to a team or to a day's duty.
  pagedHrPickerKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS, HR_MANAGE_KARKUNS_SETUP_DATA])

  # People who are not karkuns yet, to make a karkun.
  pagedHrKarkunCandidatePeople(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS])

  pagedHrKarkuns(filter: KarkunFilter): PagedKarkunType
  @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS])
}

extend type Mutation {
  createHrKarkun(
    name: String!
    parentName: String
    cnicNumber: String
    contactNumber1: String
    contactNumber2: String
    emailAddress: String
    currentAddress: String
    cityLocationId: String
    mehfilLocationId: String
    permanentAddress: String
    bloodGroup: String
    educationalQualification: String
    meansOfEarning: String
    ehadDate: String
    birthDate: String
    referenceName: String
  ): PersonType
  @checkPermissions(permissions: [HR_MANAGE_KARKUNS])

  # Makes a visitor or employee a karkun of the city and (optionally) mehfil.
  promoteHrKarkun(_id: String!, cityLocationId: String!, mehfilLocationId: String): PersonType
  @checkPermissions(permissions: [HR_MANAGE_KARKUNS])

  updateHrKarkun(
    _id: String!
    name: String!
    parentName: String
    cnicNumber: String
    contactNumber1: String
    contactNumber2: String
    emailAddress: String
    currentAddress: String
    permanentAddress: String
    cityLocationId: String
    mehfilLocationId: String
    bloodGroup: String
    educationalQualification: String
    meansOfEarning: String
    ehadDate: String
    birthDate: String
    deathDate: String
    referenceName: String
  ): PersonType
  @checkPermissions(permissions: [HR_MANAGE_KARKUNS])

  deleteHrKarkun(_id: String!): Int
  @superAdminOnly

  setHrKarkunProfileImage(_id: String!, imageData: String!): PersonType
  @checkPermissions(permissions: [HR_MANAGE_KARKUNS])

  addHrKarkunAttachment(_id: String!, attachmentId: String!): PersonType
  @checkPermissions(permissions: [HR_MANAGE_KARKUNS])

  removeHrKarkunAttachment(_id: String!, attachmentId: String!): PersonType
  @checkPermissions(permissions: [HR_MANAGE_KARKUNS])
}
`;
