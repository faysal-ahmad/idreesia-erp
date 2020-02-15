import gql from 'graphql-tag';

const OUTSTATION_AMAANAT_LOG_BY_ID = gql`
  query outstationAmaanatLogById($_id: String!) {
    outstationAmaanatLogById(_id: $_id) {
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

export default OUTSTATION_AMAANAT_LOG_BY_ID;
