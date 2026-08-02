import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateMehfilMutation,
  UpdateMehfilMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_MEHFIL: TypedDocumentNode<
  UpdateMehfilMutation,
  UpdateMehfilMutationVariables
> = gql`
  mutation updateMehfil($_id: String!, $name: String!, $mehfilDate: String!) {
    updateMehfil(_id: $_id, name: $name, mehfilDate: $mehfilDate) {
      _id
      name
      mehfilDate
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_MEHFIL;
