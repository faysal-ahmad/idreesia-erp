import gql from 'graphql-tag';

const PAGED_MESSAGES = gql`
  query pagedMessages($queryString: String) {
    pagedMessages(queryString: $queryString) {
      totalResults
      data {
        _id
        source
        messageBody
        status
        sentDate
        karkunCount
      }
    }
  }
`;

export default PAGED_MESSAGES;
