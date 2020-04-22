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
        outstationKarkunCount
      }
    }
  }
`;

export default PAGED_OUTSTATION_MESSAGES;
