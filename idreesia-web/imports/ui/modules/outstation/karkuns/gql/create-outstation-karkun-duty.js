import gql from 'graphql-tag';

export const CREATE_OUTSTATION_KARKUN_DUTY = gql`
  mutation createOutstationKarkunDuty($karkunId: String!, $dutyId: String!) {
    createOutstationKarkunDuty(karkunId: $karkunId, dutyId: $dutyId) {
      _id
      dutyId
      dutyName
    }
  }
`;
