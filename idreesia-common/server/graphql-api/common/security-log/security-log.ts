import gql from 'graphql-tag';

export default gql`
type SecurityLogType {
  _id: String
  userId: String
  operationType: String
  operationDetails: JSONObject
  operationTime: String
  operationBy: String
  dataSource: String
  dataSourceDetail: String

  userName: String
  userImageUrl: String
  userImageThumbnailUrl: String
  operationByName: String
  operationByImageUrl: String
  operationByImageThumbnailUrl: String
}

input SecurityLogFilter {
  dataSource: String
  operationType: String
  userId: String
  startTime: String
  endTime: String
  pageIndex: String
  pageSize: String
}

type PagedSecurityLogType {
  totalResults: Int
  data: [SecurityLogType]
}
`;
