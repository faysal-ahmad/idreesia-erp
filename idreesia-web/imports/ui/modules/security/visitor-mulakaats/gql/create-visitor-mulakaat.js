import gql from 'graphql-tag';

const CREATE_VISITOR_MULAKAAT = gql`
  mutation createVisitorMulakaat($visitorId: String!, $mulakaatDate: String!) {
    createVisitorMulakaat(visitorId: $visitorId, mulakaatDate: $mulakaatDate) {
      _id
      visitorId
      mulakaatDate
      cancelledDate
    }
  }
`;

export default CREATE_VISITOR_MULAKAAT;
