import gql from 'graphql-tag';

const DELETE_VISITOR_MULAKAAT = gql`
  mutation deleteVisitorMulakaat($_id: String!) {
    deleteVisitorMulakaat(_id: $_id)
  }
`;

export default DELETE_VISITOR_MULAKAAT;
