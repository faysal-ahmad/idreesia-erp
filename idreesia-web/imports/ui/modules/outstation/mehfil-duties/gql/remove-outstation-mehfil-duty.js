import gql from 'graphql-tag';

const REMOVE_OUTSTATION_MEHFIL_DUTY = gql`
  mutation removeOutstationMehfilDuty($_id: String!) {
    removeOutstationMehfilDuty(_id: $_id)
  }
`;

export default REMOVE_OUTSTATION_MEHFIL_DUTY;
