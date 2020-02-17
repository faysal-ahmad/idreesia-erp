import gql from 'graphql-tag';

const DELETE_OUTSTATION_MESSAGE = gql`
  mutation deleteOutstationMessage($_id: String!) {
    deleteOutstationMessage(_id: $_id)
  }
`;

export default DELETE_OUTSTATION_MESSAGE;
