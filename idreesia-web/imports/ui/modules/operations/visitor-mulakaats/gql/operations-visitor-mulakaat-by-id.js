import gql from 'graphql-tag';

const OPERATIONS_VISITOR_MULAKAAT_BY_ID = gql`
  query operationsVisitorMulakaatById($_id: String!) {
    operationsVisitorMulakaatById(_id: $_id) {
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

export default OPERATIONS_VISITOR_MULAKAAT_BY_ID;
