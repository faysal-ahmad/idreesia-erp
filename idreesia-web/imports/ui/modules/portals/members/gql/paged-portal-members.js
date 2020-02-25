import gql from 'graphql-tag';

const PAGED_PORTAL_MEMBERS = gql`
  query pagedPortalMembers($portalId: String!, $queryString: String) {
    pagedPortalMembers(portalId: $portalId, queryString: $queryString) {
      totalResults
      data {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        contactNumber2
        city
        country
        ehadDate
        referenceName
        imageId
        karkunId
      }
    }
  }
`;

export default PAGED_PORTAL_MEMBERS;
