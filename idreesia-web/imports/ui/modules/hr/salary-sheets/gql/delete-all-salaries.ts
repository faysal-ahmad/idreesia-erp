import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteAllSalariesMutation,
  DeleteAllSalariesMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_ALL_SALARIES: TypedDocumentNode<
  DeleteAllSalariesMutation,
  DeleteAllSalariesMutationVariables
> = gql`
  mutation deleteAllSalaries($month: String!) {
    deleteAllSalaries(month: $month)
  }
`;

export default DELETE_ALL_SALARIES;
