import gql from 'graphql-tag';

const CANCEL_SECURITY_VISITOR_MULAKAATS = gql`
  mutation cancelSecurityVisitorMulakaats($mulakaatDate: String!) {
    cancelSecurityVisitorMulakaats(mulakaatDate: $mulakaatDate)
  }
`;

export default CANCEL_SECURITY_VISITOR_MULAKAATS;
