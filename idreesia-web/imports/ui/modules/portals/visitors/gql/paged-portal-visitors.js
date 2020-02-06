import gql from 'graphql-tag';

const PAGED_PORTAL_VISITORS = gql`
  query pagedPortalVisitors($portalId: String!, $queryString: String) {
    pagedPortalVisitors(portalId: $portalId, queryString: $queryString) {
      totalResults
      data {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        city
        country
        imageId
      }
    }
  }
`;

export default PAGED_PORTAL_VISITORS;
