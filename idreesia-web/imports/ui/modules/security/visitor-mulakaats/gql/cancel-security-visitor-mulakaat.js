import gql from 'graphql-tag';

const CANCEL_SECURITY_VISITOR_MULAKAAT = gql`
  mutation cancelSecurityVisitorMulakaat($_id: String!) {
    cancelSecurityVisitorMulakaat(_id: $_id) {
      _id
      visitorId
      mulakaatDate
      cancelledDate
    }
  }
`;

export default CANCEL_SECURITY_VISITOR_MULAKAAT;
