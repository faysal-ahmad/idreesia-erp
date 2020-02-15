import gql from 'graphql-tag';

const PAGED_OUTSTATION_AMAANAT_LOGS = gql`
  query pagedOutstationAmaanatLogs($queryString: String) {
    pagedOutstationAmaanatLogs(queryString: $queryString) {
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

export default PAGED_OUTSTATION_AMAANAT_LOGS;
