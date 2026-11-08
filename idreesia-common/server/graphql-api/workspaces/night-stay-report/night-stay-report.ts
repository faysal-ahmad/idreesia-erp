import gql from 'graphql-tag';

// The Night Stay Report in the Workspaces module: Security's visitor stays for
// one night, for committees with that feature. Access is based on committee
// membership, not on Security permissions, so only the fields the report
// shows are exposed (no CNIC, contact details, criminal record or notes).
export default gql`
# A previous stay of the same visitor, on a stay's detail screen.
type WorkspaceStayHistoryItemType {
  _id: String
  fromDate: String
  toDate: String
  numOfDays: Float
  stayReason: String
}

type WorkspaceNightStayType {
  _id: String
  visitorId: String
  fromDate: String
  toDate: String
  numOfDays: Float
  stayReason: String
  stayAllowedBy: String
  visitorName: String
  visitorImageUrl: String
  visitorImageThumbnailUrl: String
  city: String
  country: String
  # The visitor's latest 5 stays before this one, newest first, not counting
  # cancelled stays.
  stayHistory: [WorkspaceStayHistoryItemType]
}

type PagedWorkspaceNightStayType {
  data: [WorkspaceNightStayType]
  totalResults: Int
}

extend type Query {
  # Stays covering 'stayDate' (DD-MM-YYYY), including ones that started on an
  # earlier day. Cancelled stays are left out. 'sortBy' is one of name, city or stayDate.
  workspaceNightStays(
    committeeId: String!
    stayDate: String!
    name: String
    city: String
    stayReason: String
    sortBy: String
    sortOrder: String
    pageIndex: String
    pageSize: String
  ): PagedWorkspaceNightStayType

  # One stay from the report; null if it doesn't exist or was cancelled.
  workspaceNightStayById(
    committeeId: String!
    stayId: String!
  ): WorkspaceNightStayType
}
`;
