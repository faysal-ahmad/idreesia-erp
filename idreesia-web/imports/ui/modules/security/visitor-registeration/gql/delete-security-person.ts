import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteSecurityPersonMutation,
  DeleteSecurityPersonMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_SECURITY_PERSON: TypedDocumentNode<
  DeleteSecurityPersonMutation,
  DeleteSecurityPersonMutationVariables
> = gql`
  mutation deleteSecurityPerson($_id: String!) {
    deleteSecurityPerson(_id: $_id)
  }
`;

export default DELETE_SECURITY_PERSON;
