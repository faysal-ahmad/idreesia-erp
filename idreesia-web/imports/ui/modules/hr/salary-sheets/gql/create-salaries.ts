import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSalariesMutation,
  CreateSalariesMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SALARIES: TypedDocumentNode<
  CreateSalariesMutation,
  CreateSalariesMutationVariables
> = gql`
  mutation createSalaries($month: String!) {
    createSalaries(month: $month)
  }
`;

export default CREATE_SALARIES;
