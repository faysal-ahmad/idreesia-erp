import gql from 'graphql-tag';

const PAGED_OPERATIONS_MESSAGES = gql`
  query pagedOperationsMessages($filter: MessageFilter) {
    pagedOperationsMessages(filter: $filter) {
      totalResults
      data {
        _id
        messageBody
        status
        sentDate
        karkunCount
        succeededMessageCount
        failedMessageCount
      }
    }
  }
`;

export default PAGED_OPERATIONS_MESSAGES;
