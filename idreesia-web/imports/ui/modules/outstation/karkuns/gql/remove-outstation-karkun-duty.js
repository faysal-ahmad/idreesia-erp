import gql from 'graphql-tag';

export const REMOVE_OUTSTATION_KARKUN_DUTY = gql`
  mutation removeOutstationKarkunDuty($_id: String!) {
    removeOutstationKarkunDuty(_id: $_id)
  }
`;
