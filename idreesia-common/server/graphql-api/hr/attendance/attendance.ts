import gql from 'graphql-tag';

export default gql`
type AttendanceType {
  _id: String
  karkunId: String
  dutyId: String
  shiftId: String
  jobId: String
  month: String
  attendanceDetails: String
  presentCount: Int
  absentCount: Int
  percentage: Float
  meetingCardBarcodeId: String

  karkun: PersonType
  job: JobType
  duty: DutyType
  shift: DutyShiftType

  createdByName: String
  updatedByName: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}
type PagedAttendanceType {
  totalResults: Int
  data: [AttendanceType]
}
extend type Query {
  attendanceById(_id: String!): AttendanceType
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS, HR_DELETE_DATA])
  pagedAttendanceByKarkun(queryString: String): PagedAttendanceType
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS, HR_DELETE_DATA])
  attendanceByMonth(
    month: String!
    categoryId: String
    subCategoryId: String
  ): [AttendanceType]
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS, HR_DELETE_DATA])
  attendanceByBarcodeId(barcodeId: String!): AttendanceType
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS, HR_DELETE_DATA])
  attendanceByBarcodeIds(barcodeIds: String!): [AttendanceType]
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS, HR_DELETE_DATA])
}

extend type Mutation {
  createAttendances(
    month: String!
  ): Int
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS, HR_DELETE_DATA])

  updateAttendance(
    _id: String!
    attendanceDetails: String
    presentCount: Int
    absentCount: Int
    percentage: Int
  ): AttendanceType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS, HR_DELETE_DATA])

  importAttendances(
    month: String!
    dutyId: String!
    shiftId: String
  ): Int
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS])

  deleteAttendances(month: String!, ids: [String]!): Int
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS, HR_DELETE_DATA])
  deleteAllAttendances(month: String!, categoryId: String, subCategoryId: String): Int
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS, HR_DELETE_DATA])
}
`;
