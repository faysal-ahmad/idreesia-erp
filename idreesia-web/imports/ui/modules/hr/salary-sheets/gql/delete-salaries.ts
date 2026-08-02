import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteSalariesMutation,
  DeleteSalariesMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_SALARIES: TypedDocumentNode<
  DeleteSalariesMutation,
  DeleteSalariesMutationVariables
> = gql`
  mutation deleteSalaries($month: String!, $ids: [String]!) {
    deleteSalaries(month: $month, ids: $ids)
  }
`;

export default DELETE_SALARIES;
