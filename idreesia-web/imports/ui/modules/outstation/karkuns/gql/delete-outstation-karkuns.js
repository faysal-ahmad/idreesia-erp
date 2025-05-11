import gql from 'graphql-tag';

export const DELETE_OUTSTATION_KARKUNS = gql`
  mutation deleteOutstationKarkuns($_ids: [String]!) {
    deleteOutstationKarkuns(_ids: $_ids)
  }
`;
