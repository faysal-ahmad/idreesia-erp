import gql from 'graphql-tag';

const CREATE_OPERATIONS_VISITOR_MULAKAAT = gql`
  mutation createOperationsVisitorMulakaat(
    $visitorId: String!
    $mulakaatDate: String!
  ) {
    createOperationsVisitorMulakaat(
      visitorId: $visitorId
      mulakaatDate: $mulakaatDate
    ) {
      _id
      visitorId
      mulakaatDate
      cancelledDate
    }
  }
`;

export default CREATE_OPERATIONS_VISITOR_MULAKAAT;
