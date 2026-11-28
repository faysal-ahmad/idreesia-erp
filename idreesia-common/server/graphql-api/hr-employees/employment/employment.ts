import gql from 'graphql-tag';

export default gql`
type EmploymentEventType {
  _id: String
  personId: String
  eventType: String
  effectiveDate: String
  exitReason: String
  details: JSON
  remarks: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type HrEmploymentSettingsType {
  defaultProbationMonths: Int
  updatedAt: String
  updatedBy: String
}

extend type Query {
  employmentEventsByPersonId(personId: String!): [EmploymentEventType]
    @checkPermissions(permissions: [HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES])

  # Karkuns of Multan, to pick whom an employee reports to.
  pagedHrReportsToKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

  hrEmploymentSettings: HrEmploymentSettingsType
    @checkPermissions(permissions: [HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES, HR_MANAGE_EMPLOYEES_SETUP_DATA])
}

extend type Mutation {
  hireEmployee(
    personId: String!
    jobId: String!
    jobShiftId: String
    startDate: String!
    onProbation: Boolean!
    probationEndDate: String
    remarks: String
  ): HrEmployeeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

  rejoinEmployee(
    personId: String!
    jobId: String!
    jobShiftId: String
    startDate: String!
    onProbation: Boolean!
    probationEndDate: String
    remarks: String
  ): HrEmployeeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

  confirmEmployee(
    personId: String!
    confirmationDate: String!
    remarks: String
  ): HrEmployeeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

  changeEmployeeJob(
    personId: String!
    jobId: String!
    jobShiftId: String
    effectiveDate: String!
    remarks: String
  ): HrEmployeeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

  exitEmployee(
    personId: String!
    endDate: String!
    exitReason: String!
    remarks: String
  ): HrEmployeeType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES])

  updateHrEmploymentSettings(defaultProbationMonths: Int!): HrEmploymentSettingsType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES_SETUP_DATA])
}
`;
