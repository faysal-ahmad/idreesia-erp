import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateLoginTimeMutation,
  UpdateLoginTimeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const UPDATE_LOGIN_TIME: TypedDocumentNode<
  UpdateLoginTimeMutation,
  UpdateLoginTimeMutationVariables
> = gql`
  mutation updateLoginTime {
    updateLoginTime
  }
`;
