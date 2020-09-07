import gql from 'graphql-tag';

const CREATE_OUTSTATION_MEHFIL_DUTY = gql`
  mutation createOutstationMehfilDuty($name: String!, $description: String) {
    createOutstationMehfilDuty(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default CREATE_OUTSTATION_MEHFIL_DUTY;
