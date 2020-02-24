import gql from 'graphql-tag';

const SECURITY_VISITOR_MULAKAAT_BY_ID = gql`
  query securityVisitorMulakaatById($_id: String!) {
    securityVisitorMulakaatById(_id: $_id) {
      _id
      mulakaatDate
      visitor {
        _id
        name
        parentName
        cnicNumber
        city
        country
      }
    }
  }
`;

export default SECURITY_VISITOR_MULAKAAT_BY_ID;
