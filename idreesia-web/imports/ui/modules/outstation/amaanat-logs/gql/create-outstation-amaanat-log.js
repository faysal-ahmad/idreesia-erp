import gql from 'graphql-tag';

const CREATE_OUTSTATION_AMAANAT_LOG = gql`
  mutation createOutstationAmaanatLog(
    $cityId: String!
    $cityMehfilId: String!
    $sentDate: String!
    $totalAmount: Float!
    $hadiaPortion: Float
    $sadqaPortion: Float
    $zakaatPortion: Float
    $langarPortion: Float
    $otherPortion: Float
    $otherPortionDescription: String
  ) {
    createOutstationAmaanatLog(
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

export default CREATE_OUTSTATION_AMAANAT_LOG;
