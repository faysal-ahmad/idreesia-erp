import gql from 'graphql-tag';

export default gql`
# A person as a person picker shows them; every picker search returns these.
type PickerPersonType {
  _id: String!
  name: String
  parentName: String
  cnicNumber: String
  contactNumber1: String
  imageUrl: String
  imageThumbnailUrl: String
  # Only filled by the searches that mark who already has a user account.
  hasUserAccount: Boolean
}

type PagedPickerPersonType {
  totalResults: Int
  data: [PickerPersonType]
}

type PersonImageVectorDataType {
  status: String
}

type PersonSharedDataType {
  name: String
  parentName: String
  cnicNumber: String
  birthDate: String
  currentAddress: String
  permanentAddress: String
  contactNumber1: String
  contactNumber2: String
  emailAddress: String
  bloodGroup: String
  educationalQualification: String
  meansOfEarning: String
  ehadDate: String
  deathDate: String
  referenceName: String
  imageUrl: String
  imageThumbnailUrl: String
  imageVectorData: PersonImageVectorDataType
  tagIds: [String]

  tags: [PeopleTagType]
}

type PersonVisitorDataType {
  city: String
  country: String
  criminalRecord: String
  otherNotes: String
}

type PersonKarkunDataType {
  cityLocationId: String
  mehfilLocationId: String
  ehadKarkun: Boolean
  ehadPermissionDate: String
  lastTarteebDate: String
  mehfilRaabta: String
  msRaabta: String
  msLastVisitDate: String
  attachmentIds: [String]

  cityLocation: ReferenceOrgLocationType
  mehfilLocation: ReferenceOrgLocationType
  teams: [TeamType]
  attachments: [Attachment]
}

# Employment details. Only HrEmployeeType exposes them, and only the employee
# and leave queries return that type: no PersonType query, karkun management's
# included, ever reaches them.
type PersonEmployeeDataType {
  jobId: String
  jobShiftId: String
  workingDays: [String]
  reportsToPersonId: String
  employmentStatus: String
  employmentStartDate: String
  employmentEndDate: String
  probationEndDate: String
  confirmationDate: String
  bankAccountDetails: String

  job: JobType
  jobShift: JobShiftType
  reportsTo: PersonType
}

type PersonType {
  _id: String
  isEmployee: Boolean
  isVisitor: Boolean
  isKarkun: Boolean
  userId: String
  dataSource: String
  sharedData: PersonSharedDataType
  visitorData: PersonVisitorDataType
  karkunData: PersonKarkunDataType
  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
  deletedAt: String
  deletedBy: String
}

# The minimal view of a person that other modules' reference data may expose
# (team members, etc.). Never add contact, address, notes or other sensitive
# fields here.
type PersonBasicSharedDataType {
  name: String
  cnicNumber: String
  contactNumber1: String
  contactNumber2: String
  imageUrl: String
  imageThumbnailUrl: String
}

type PersonBasicType {
  _id: String
  sharedData: PersonBasicSharedDataType
}

input PersonFilter {
  name: String
  cnicNumber: String
  phoneNumber: String
  city: String
  ehadDuration: String
  ehadDate: String
  additionalInfo: String
  dataSource: String
  updatedBetween: String
  tagId: String
  pageIndex: String
  pageSize: String
}

type PagedPeopleType {
  totalResults: Int
  data: [PersonType]
}

extend type Query {
  distinctCities: [String]
  distinctCountries: [String]
}
`;
