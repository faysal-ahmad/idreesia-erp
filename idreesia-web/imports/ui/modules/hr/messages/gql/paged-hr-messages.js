import gql from 'graphql-tag';

const PAGED_HR_MESSAGES = gql`
  query pagedHrMessages($filter: MessageFilter) {
    pagedHrMessages(filter: $filter) {
      totalResults
      data {
        _id
        messageBody
        status
        sentDate
        msKarkunCount
      }
    }
  }
`;

export default PAGED_HR_MESSAGES;
