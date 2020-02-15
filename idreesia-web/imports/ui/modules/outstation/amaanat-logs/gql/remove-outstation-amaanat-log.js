import gql from 'graphql-tag';

const REMOVE_OUTSTATION_AMAANAT_LOG = gql`
  mutation removeOutstationAmaanatLog($_id: String!) {
    removeOutstationAmaanatLog(_id: $_id)
  }
`;

export default REMOVE_OUTSTATION_AMAANAT_LOG;
