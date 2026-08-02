import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ApproveSalariesMutation,
  ApproveSalariesMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const APPROVE_SALARIES: TypedDocumentNode<
  ApproveSalariesMutation,
  ApproveSalariesMutationVariables
> = gql`
  mutation approveSalaries($month: String!, $ids: [String]!) {
    approveSalaries(month: $month, ids: $ids)
  }
`;

export default APPROVE_SALARIES;
