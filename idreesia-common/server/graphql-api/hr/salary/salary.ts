import gql from 'graphql-tag';

export default gql`
type SalaryType {
  _id: String
  karkunId: String
  jobId: String
  month: String
  salary: Int
  openingLoan: Int
  loanDeduction: Int
  newLoan: Int
  closingLoan: Int
  otherDeduction: Int
  arrears: Int
  netPayment: Int
  rashanMadad: Int

  karkun: PersonType
  job: JobType
  approver: PersonType

  approvedOn: String
  approvedBy: String
  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}
type PagedSalaryType {
  totalResults: Int
  salaries: [SalaryType]
}
extend type Query {
  pagedSalariesByKarkun(queryString: String): PagedSalaryType
    @checkPermissions(
      permissions: [HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES, HR_DELETE_DATA]
      dataFieldName: "salaries"
    )
  salariesByMonth(
    month: String!
    jobId: String
  ): [SalaryType]
    @checkPermissions(permissions: [HR_VIEW_EMPLOYEES, HR_MANAGE_EMPLOYEES, HR_DELETE_DATA])
  salariesByIds(ids: String!): [SalaryType]
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS, HR_DELETE_DATA])
}

extend type Mutation {
  createSalaries(
    month: String!
  ): Int
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES, HR_DELETE_DATA])

  updateSalary(
    _id: String!
    salary: Int
    openingLoan: Int
    loanDeduction: Int
    otherDeduction: Int
    newLoan: Int
    arrears: Int
    rashanMadad: Int
  ): SalaryType
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES, HR_DELETE_DATA])

  deleteSalaries(month: String!, ids: [String]!): Int
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES, HR_DELETE_DATA])
  deleteAllSalaries(month: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_EMPLOYEES, HR_DELETE_DATA])
}
`;
