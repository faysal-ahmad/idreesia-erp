import gql from 'graphql-tag';

const PAGED_PORTAL_AMAANAT_LOGS = gql`
  query pagedPortalAmaanatLogs($portalId: String!, $queryString: String) {
    pagedPortalAmaanatLogs(portalId: $portalId, queryString: $queryString) {
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

export default PAGED_PORTAL_AMAANAT_LOGS;
