import gql from 'graphql-tag';

const DELETE_SECURITY_VISITOR = gql`
  mutation deleteSecurityVisitor($_id: String!) {
    deleteSecurityVisitor(_id: $_id)
  }
`;

export default DELETE_SECURITY_VISITOR;
