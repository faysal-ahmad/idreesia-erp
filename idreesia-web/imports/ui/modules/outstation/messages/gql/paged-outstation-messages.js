import gql from 'graphql-tag';

const PAGED_OUTSTATION_MESSAGES = gql`
  query pagedOutstationMessages($filter: MessageFilter) {
    pagedOutstationMessages(filter: $filter) {
      totalResults
      data {
        _id
        messageBody
        status
        sentDate
        karkunCount
      }
    }
  }
`;

export default PAGED_OUTSTATION_MESSAGES;
