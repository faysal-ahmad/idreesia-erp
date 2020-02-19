import gql from 'graphql-tag';

const VISITOR_MULAKAAT_BY_ID = gql`
  query visitorMulakaatById($_id: String!) {
    visitorMulakaatById(_id: $_id) {
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

export default VISITOR_MULAKAAT_BY_ID;
