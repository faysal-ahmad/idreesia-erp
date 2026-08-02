import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteSecurityVisitorMutation,
  DeleteSecurityVisitorMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_SECURITY_VISITOR: TypedDocumentNode<
  DeleteSecurityVisitorMutation,
  DeleteSecurityVisitorMutationVariables
> = gql`
  mutation deleteSecurityVisitor($_id: String!) {
    deleteSecurityVisitor(_id: $_id)
  }
`;

export default DELETE_SECURITY_VISITOR;
