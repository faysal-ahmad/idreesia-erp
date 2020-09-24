import gql from 'graphql-tag';

const PAGED_OUTSTATION_SECURITY_LOGS = gql`
  query pagedOutstationSecurityLogs($filter: SecurityLogFilter) {
    pagedOutstationSecurityLogs(filter: $filter) {
      totalResults
      data {
        _id
        userId
        operationType
        operationDetails
        operationTime
        operationBy
        dataSource
        userName
        userImageId
        operationByName
        operationByImageId
      }
    }
  }
`;

export default PAGED_OUTSTATION_SECURITY_LOGS;
