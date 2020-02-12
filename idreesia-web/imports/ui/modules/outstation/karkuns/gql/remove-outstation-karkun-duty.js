import gql from 'graphql-tag';

const REMOVE_OUTSTATION_KARKUN_DUTY = gql`
  mutation removeOutstationKarkunDuty($_id: String!) {
    removeOutstationKarkunDuty(_id: $_id)
  }
`;

export default REMOVE_OUTSTATION_KARKUN_DUTY;
