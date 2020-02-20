import gql from 'graphql-tag';

const CANCEL_VISITOR_MULAKAAT = gql`
  mutation cancelVisitorMulakaat($_id: String!) {
    cancelVisitorMulakaat(_id: $_id) {
      _id
      visitorId
      mulakaatDate
      cancelledDate
    }
  }
`;

export default CANCEL_VISITOR_MULAKAAT;
