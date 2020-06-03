import gql from 'graphql-tag';

const PAGED_COMM_MESSAGES = gql`
  query pagedCommMessages($filter: MessageFilter) {
    pagedCommMessages(filter: $filter) {
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

export default PAGED_COMM_MESSAGES;
