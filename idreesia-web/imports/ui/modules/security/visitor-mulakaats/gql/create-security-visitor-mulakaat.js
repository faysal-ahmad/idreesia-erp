import gql from 'graphql-tag';

const CREATE_SECURITY_VISITOR_MULAKAAT = gql`
  mutation createSecurityVisitorMulakaat(
    $visitorId: String!
    $mulakaatDate: String!
  ) {
    createSecurityVisitorMulakaat(
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

export default CREATE_SECURITY_VISITOR_MULAKAAT;
