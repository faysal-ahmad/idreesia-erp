import gql from 'graphql-tag';

export default gql`
# An employee: the person, with their employment details. This is the only
# type that exposes employeeData, and only employee management (and the leave
# screens, which are about employees) return it. Karkun management returns
# PersonType, which has no employment details.
type HrEmployeeType {
  _id: String
  isEmployee: Boolean
  isKarkun: Boolean
  isVisitor: Boolean
  dataSource: String
  sharedData: PersonSharedDataType
  karkunData: PersonKarkunDataType
  employeeData: PersonEmployeeDataType
  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedHrEmployeeType {
  totalResults: Int
  data: [HrEmployeeType]
}

input HrEmployeeFilter {
  name: String
  cnicNumber: String
  phoneNumber: String
  bloodGroup: String
  jobId: String
  employmentStatus: String
  probationEndingWithinDays: String
  pageIndex: String
  pageSize: String
}

# Employee management. Gated by the employee permissions only, and each
# operation reaches employees only (current or former).
extend type Query {
  hrEmployeeById(_id: String!): HrEmployeeType
    @checkPermissions(permissions: [HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES])

  hrEmployeesById(_ids: String!): [HrEmployeeType]
    @checkPermissions(permissions: [HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES])

  # Current employees of Multan.
  pagedHrEmployees(filter: HrEmployeeFilter): PagedHrEmployeeType
    @checkPermissions(permissions: [HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES])

  # Karkuns of Multan who are not employees yet, to make an employee.
  pagedHrEmployeeCandidateKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])
}

extend type Mutation {
  updateHrEmployee(
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
  ): HrEmployeeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

  # The employment fields HR edits directly. Status and job change only
  # through the lifecycle mutations (hireEmployee, exitEmployee, ...).
  setHrEmployeeEmploymentInfo(
    _id: String!
    employmentStartDate: String
    employmentEndDate: String
    probationEndDate: String
    confirmationDate: String
    bankAccountDetails: String
    jobShiftId: String
    workingDays: [String]
    reportsToPersonId: String
  ): HrEmployeeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

  setHrEmployeeProfileImage(_id: String!, imageData: String!): HrEmployeeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

  addHrEmployeeAttachment(_id: String!, attachmentId: String!): HrEmployeeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

  removeHrEmployeeAttachment(_id: String!, attachmentId: String!): HrEmployeeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])
}
`;
