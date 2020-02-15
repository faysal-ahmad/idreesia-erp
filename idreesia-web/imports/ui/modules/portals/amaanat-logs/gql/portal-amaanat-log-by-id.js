import gql from 'graphql-tag';

const PORTAL_AMAANAT_LOG_BY_ID = gql`
  query portalAmaanatLogById($portalId: String!, $_id: String!) {
    portalAmaanatLogById(portalId: $portalId, _id: $_id) {
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
      otherPortionDescription
    }
  }
`;

export default PORTAL_AMAANAT_LOG_BY_ID;
