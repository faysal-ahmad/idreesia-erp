import gql from 'graphql-tag';

const DELETE_OUTSTATION_KARKUNS = gql`
  mutation deleteOutstationKarkuns($_ids: [String]!) {
    deleteOutstationKarkuns(_ids: $_ids)
  }
`;

export default DELETE_OUTSTATION_KARKUNS;
