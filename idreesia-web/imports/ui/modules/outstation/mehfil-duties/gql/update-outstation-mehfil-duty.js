import gql from 'graphql-tag';

const UPDATE_OUTSTATION_MEHFIL_DUTY = gql`
  mutation updateOutstationMehfilDuty(
    $_id: String!
    $name: String!
    $description: String
  ) {
    updateOutstationMehfilDuty(
      _id: $_id
      name: $name
      description: $description
    ) {
      _id
      name
      description
    }
  }
`;

export default UPDATE_OUTSTATION_MEHFIL_DUTY;
