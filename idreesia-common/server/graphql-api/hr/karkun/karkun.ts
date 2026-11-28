import gql from 'graphql-tag';

export default gql`
extend type Query {
  hrCommitteeOptions: [CommitteeType]
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS_SETUP_DATA])

  hrKarkunById(_id: String!): PersonType
  @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS, HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES])

  hrKarkunsById(_ids: String!): [PersonType]
  @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS, HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES])

  # Karkuns of Multan, to add to a team or to a day's duty.
  pagedHrPickerKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS, HR_MANAGE_KARKUNS_SETUP_DATA])

  # Karkuns of Multan who are not employees yet, to make an employee.
  pagedHrEmployeeCandidateKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

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
  @checkPermissions(
    permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS, HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES]
    anyStorePermissions: [
      IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS,
      IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS,
      IN_VIEW_STOCK_ADJUSTMENTS, IN_MANAGE_STOCK_ADJUSTMENTS
    ]
  )
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
  @checkPermissions(permissions: [HR_MANAGE_KARKUNS, HR_MANAGE_EMPLOYEES])

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
  @checkPermissions(permissions: [HR_MANAGE_KARKUNS, HR_MANAGE_EMPLOYEES])

  deleteHrKarkun(_id: String!): Int
  @superAdminOnly

  setHrKarkunEmploymentInfo(
    _id: String!
    isEmployee: Boolean!
    jobId: String
    employmentStartDate: String
    employmentEndDate: String
    bankAccountDetails: String
  ): PersonType
  @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

  setHrKarkunProfileImage(_id: String!, imageData: String!): PersonType
  @checkPermissions(permissions: [HR_MANAGE_KARKUNS])

  addHrKarkunAttachment(_id: String!, attachmentId: String!): PersonType
  @checkPermissions(permissions: [HR_MANAGE_KARKUNS])

  removeHrKarkunAttachment(_id: String!, attachmentId: String!): PersonType
  @checkPermissions(permissions: [HR_MANAGE_KARKUNS])
}
`;
