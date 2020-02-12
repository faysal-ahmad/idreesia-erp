import gql from 'graphql-tag';

const CREATE_OUTSTATION_KARKUN_DUTY = gql`
  mutation createOutstationKarkunDuty($karkunId: String!, $dutyId: String!) {
    createOutstationKarkunDuty(karkunId: $karkunId, dutyId: $dutyId) {
      _id
      dutyId
      dutyName
    }
  }
`;

export default CREATE_OUTSTATION_KARKUN_DUTY;
