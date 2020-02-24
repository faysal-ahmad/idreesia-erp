import gql from 'graphql-tag';

const DELETE_SECURITY_VISITOR_MULAKAAT = gql`
  mutation deleteSecurityVisitorMulakaat($_id: String!) {
    deleteSecurityVisitorMulakaat(_id: $_id)
  }
`;

export default DELETE_SECURITY_VISITOR_MULAKAAT;
