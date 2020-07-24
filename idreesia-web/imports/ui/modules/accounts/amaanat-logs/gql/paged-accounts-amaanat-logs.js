import gql from 'graphql-tag';

const PAGED_ACCOUNTS_AMAANAT_LOGS = gql`
  query pagedAccountsAmaanatLogs($filter: AmaanatLogFilter) {
    pagedAccountsAmaanatLogs(filter: $filter) {
      totalResults
      data {
        _id
        cityId
        cityMehfilId
        sentDate
        totalAmount
        hadiaPortion
        sadqaPortion
        zakaatPortion
        langarPortion
        otherPortion
        city {
          _id
          name
        }
        cityMehfil {
          _id
          name
        }
      }
    }
  }
`;

export default PAGED_ACCOUNTS_AMAANAT_LOGS;
