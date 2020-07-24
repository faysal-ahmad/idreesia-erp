import gql from 'graphql-tag';

const UPDATE_ACCOUNTS_AMAANAT_LOG = gql`
  mutation updateAccountsAmaanatLog(
    $_id: String!
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
    updateAccountsAmaanatLog(
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

export default UPDATE_ACCOUNTS_AMAANAT_LOG;
