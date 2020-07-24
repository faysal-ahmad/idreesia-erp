import gql from 'graphql-tag';

const CANCEL_OPERATIONS_VISITOR_MULAKAATS = gql`
  mutation cancelOperationsVisitorMulakaats($mulakaatDate: String!) {
    cancelOperationsVisitorMulakaats(mulakaatDate: $mulakaatDate)
  }
`;

export default CANCEL_OPERATIONS_VISITOR_MULAKAATS;
