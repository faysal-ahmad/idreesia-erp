import gql from 'graphql-tag';

const PAGED_PORTAL_KARKUNS = gql`
  query pagedPortalKarkuns($portalId: String!, $queryString: String) {
    pagedPortalKarkuns(portalId: $portalId, queryString: $queryString) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        imageId
        duties {
          _id
          dutyId
          dutyName
        }
        city {
          _id
          name
          country
        }
        cityMehfil {
          _id
          name
        }
      }
    }
  }
`;

export default PAGED_PORTAL_KARKUNS;
