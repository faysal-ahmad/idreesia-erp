import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateMehfilMutation,
  CreateMehfilMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_MEHFIL: TypedDocumentNode<
  CreateMehfilMutation,
  CreateMehfilMutationVariables
> = gql`
  mutation createMehfil($name: String!, $mehfilDate: String!) {
    createMehfil(name: $name, mehfilDate: $mehfilDate) {
      _id
      name
      mehfilDate
    }
  }
`;

export default CREATE_MEHFIL;
