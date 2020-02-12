import gql from 'graphql-tag';

const DELETE_OUTSTATION_KARKUN = gql`
  mutation deleteOutstationKarkun($_id: String!) {
    deleteOutstationKarkun(_id: $_id)
  }
`;

export default DELETE_OUTSTATION_KARKUN;
