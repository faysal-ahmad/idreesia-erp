import gql from 'graphql-tag';

const UPDATE_PORTAL_AMAANAT_LOG = gql`
  mutation updatePortalAmaanatLog(
    $portalId: String!
    $_id: String!
    $cityId: String!
    $cityMehfilId: String
    $sentDate: String!
    $totalAmount: Float!
    $hadiaPortion: Float
    $sadqaPortion: Float
    $zakaatPortion: Float
    $langarPortion: Float
    $otherPortion: Float
    $otherPortionDescription: String
  ) {
    updatePortalAmaanatLog(
      portalId: $portalId
      _id: $_id
      cityId: $cityId
      cityMehfilId: $cityMehfilId
      sentDate: $sentDate
      totalAmount: $totalAmount
      hadiaPortion: $hadiaPortion
      sadqaPortion: $sadqaPortion
      zakaatPortion: $zakaatPortion
      langarPortion: $langarPortion
      otherPortion: $otherPortion
      otherPortionDescription: $otherPortionDescription
    ) {
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

export default UPDATE_PORTAL_AMAANAT_LOG;
