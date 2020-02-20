import gql from 'graphql-tag';

const CANCEL_MULAKAATS = gql`
  mutation cancelMulakaats($mulakaatDate: String!) {
    cancelMulakaats(mulakaatDate: $mulakaatDate)
  }
`;

export default CANCEL_MULAKAATS;
