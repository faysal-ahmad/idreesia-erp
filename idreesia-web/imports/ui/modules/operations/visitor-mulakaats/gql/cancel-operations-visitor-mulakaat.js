import gql from 'graphql-tag';

const CANCEL_OPERATIONS_VISITOR_MULAKAAT = gql`
  mutation cancelOperationsVisitorMulakaat($_id: String!) {
    cancelOperationsVisitorMulakaat(_id: $_id) {
      _id
      visitorId
      mulakaatDate
      cancelledDate
    }
  }
`;

export default CANCEL_OPERATIONS_VISITOR_MULAKAAT;
