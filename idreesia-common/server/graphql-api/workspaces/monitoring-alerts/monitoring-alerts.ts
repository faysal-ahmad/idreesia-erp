import gql from 'graphql-tag';

// Monitoring Alerts in the Workspaces module: the security server's
// face-match alerts for one day, for committees with that feature. Access is
// based on committee membership, not on Security permissions, so only the
// fields the report shows are exposed. Read-only.
export default gql`
type WorkspaceMonitoringAlertType {
  _id: String
  timestamp: String
  profileName: String
  profileIsTest: Boolean
  channelName: String
  similarityScore: Float
  # CORRECT, FALSE_POSITIVE, or null when not reviewed yet.
  review: String
  imageUrl: String
  thumbnailUrl: String
}

type PagedWorkspaceMonitoringAlertType {
  data: [WorkspaceMonitoringAlertType]
  totalResults: Int
}

extend type Query {
  # Alerts raised on 'date' (DD-MM-YYYY), newest first. Alerts of test
  # profiles are included unless 'includeTest' is false.
  workspaceMonitoringAlerts(
    committeeId: String!
    date: String!
    includeTest: Boolean
    pageIndex: String
    pageSize: String
  ): PagedWorkspaceMonitoringAlertType
}
`;
