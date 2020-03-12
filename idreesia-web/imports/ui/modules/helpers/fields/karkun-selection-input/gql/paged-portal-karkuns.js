import gql from 'graphql-tag';

const PAGED_PORTAL_KARKUNS = gql`
  query pagedPortalKarkuns($portalId: String!, $filter: KarkunFilter) {
    pagedPortalKarkuns(portalId: $portalId, filter: $filter) {
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
